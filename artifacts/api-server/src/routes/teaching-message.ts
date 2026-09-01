import { Router, type IRouter } from "express";
import {
  GenerateTeachingMessageBody,
  GenerateTeachingMessageResponse,
  type LessonPlanInput,
} from "@workspace/api-zod";

const router: IRouter = Router();
const GEMINI_MODEL = "gemini-2.5-flash";

type LessonLanguage = LessonPlanInput["language"];

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getDemoTeachingReply(
  input: {
    setup: LessonPlanInput;
    question: string;
  },
): string {
  const { setup, question } = input;
  const normalizedQuestion = question.toLowerCase();
  const asksSecondLaw =
    normalizedQuestion.includes("second law") ||
    normalizedQuestion.includes("2nd law") ||
    normalizedQuestion.includes("दूसरा नियम") ||
    normalizedQuestion.includes("दुसरा नियम") ||
    normalizedQuestion.includes("दूसरा नियम");

  const replies: Record<LessonLanguage, string> = {
    English: asksSecondLaw
      ? `Newton's Second Law says that force, mass, and acceleration are connected by F = ma. In simple terms, a stronger push gives more acceleration, while a heavier object needs more force for the same acceleration. For example, an empty shopping cart speeds up more than a full cart when you push both with the same force. Does this relationship make sense with an example from your day?`
      : `For your question, "${question}", let’s connect the answer to ${setup.topic}. At a ${setup.level} level, start by identifying the main idea, then link it to one familiar example. What part of this idea would you like to unpack first?`,
    Hindi: asksSecondLaw
      ? `न्यूटन का दूसरा नियम बताता है कि बल, द्रव्यमान और त्वरण का संबंध F = ma से होता है। आसान शब्दों में, ज़्यादा धक्का देने पर त्वरण बढ़ता है, और भारी वस्तु को उतना ही त्वरण देने के लिए ज़्यादा बल चाहिए। जैसे, एक खाली शॉपिंग ट्रॉली उसी धक्के से भरी ट्रॉली से जल्दी गति पकड़ती है। क्या आप अपने रोज़मर्रा के जीवन का ऐसा उदाहरण बता सकते हैं?`
      : `आपके सवाल "${question}" का जवाब ${setup.topic} की मुख्य बात से जुड़ा है। ${setup.level} स्तर पर पहले मुख्य विचार पहचानें और फिर उसे एक परिचित उदाहरण से जोड़ें। इस विचार का कौन सा हिस्सा आपको और समझना है?`,
    Marathi: asksSecondLaw
      ? `न्यूटनचा दुसरा नियम बल, वस्तुमान आणि त्वरण यांचा संबंध F = ma असा सांगतो. सोप्या भाषेत, जास्त जोर लावल्यास त्वरण वाढते; आणि जड वस्तूला तेवढेच त्वरण देण्यासाठी जास्त बल लागते. उदाहरणार्थ, समान जोर लावल्यावर रिकामी खरेदीची ट्रॉली भरलेल्या ट्रॉलीपेक्षा लवकर वेग घेते. तुमच्या रोजच्या जीवनातील असे उदाहरण कोणते?`
      : `तुमच्या प्रश्नाचे उत्तर "${question}" हे ${setup.topic} मधील मुख्य कल्पनेशी जोडूया. ${setup.level} स्तरावर आधी मुख्य मुद्दा ओळखा आणि मग तो परिचित उदाहरणाशी जोडा. या कल्पनेतील कोणता भाग तुम्हाला अजून समजून घ्यायचा आहे?`,
    Hinglish: asksSecondLaw
      ? `Newton's Second Law bolta hai ki force, mass aur acceleration ka relation F = ma hota hai. Simple words mein, stronger push se acceleration badhta hai, aur heavier object ko same acceleration ke liye zyada force chahiye. Example: same push dene par empty shopping cart, full cart se jaldi speed pakadti hai. Kya tum apni daily life ka aisa example bata sakte ho?`
      : `Tumhare question "${question}" ko ${setup.topic} ke main idea se connect karte hain. ${setup.level} level par pehle main point identify karo, phir use ek familiar example se jodo. Is idea ka kaunsa part tum aur samajhna chahoge?`,
  };

  return replies[setup.language];
}

function getTeachingPrompt(input: {
  setup: LessonPlanInput;
  lesson: {
    mode: "gemini" | "demo";
    plan: {
      title: string;
      summary: string;
      concepts: string[];
      teachingOrder: Array<{ title: string; minutes: number; description: string }>;
    };
  };
  question: string;
}): string {
  const { setup, lesson, question } = input;
  return `You are the AI Teacher in an ongoing lesson. Answer the student's actual question specifically; do not give a generic response or ask them to clarify unless the question is genuinely impossible to understand.

Student setup:
- Topic: ${setup.topic}
- Level: ${setup.level}
- Language: ${setup.language}
- Available time: ${setup.availableTime}
- Learning goal: ${setup.learningGoal}

Lesson context:
- Title: ${lesson.plan.title}
- Summary: ${lesson.plan.summary}
- Concepts: ${lesson.plan.concepts.join(", ")}
- Teaching order: ${lesson.plan.teachingOrder.map((step) => step.title).join(" -> ")}

Student's exact question:
${question}

Response requirements:
- Answer that exact question first and stay focused on ${setup.topic}.
- Use language ${setup.language}. For Hinglish, use a natural Hindi-English mix. Do not switch languages.
- Match the explanation to a ${setup.level} student.
- Use a simple real-world example when it helps. If the question is about Newton's Second Law, explain F = ma plainly and include a concrete everyday example.
- End with exactly one short follow-up question that checks understanding.
- Return only the learner-facing answer, with no preface about being an AI, no metadata, and no markdown code fences.`;
}

async function generateWithGemini(input: {
  setup: LessonPlanInput;
  lesson: {
    mode: "gemini" | "demo";
    plan: {
      title: string;
      summary: string;
      concepts: string[];
      teachingOrder: Array<{ title: string; minutes: number; description: string }>;
    };
  };
  question: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: getTeachingPrompt(input) }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 500,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Gemini returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const message = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!message) {
    throw new Error("Gemini returned an empty teaching response");
  }

  return message;
}

router.post("/teaching-message", async (req, res) => {
  const parsed = GenerateTeachingMessageBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid teaching message request");
    res.status(400).json({ error: "Please provide a valid student question and lesson context." });
    return;
  }

  const input = parsed.data;
  try {
    const message = process.env.GEMINI_API_KEY
      ? await generateWithGemini(input)
      : getDemoTeachingReply(input);

    res.json(GenerateTeachingMessageResponse.parse({
      mode: process.env.GEMINI_API_KEY ? "gemini" : "demo",
      message,
    }));
  } catch (error) {
    req.log.warn({ err: error }, "Teaching AI unavailable; using demo response");
    res.json(GenerateTeachingMessageResponse.parse({
      mode: "demo",
      message: getDemoTeachingReply(input),
    }));
  }
});

export default router;