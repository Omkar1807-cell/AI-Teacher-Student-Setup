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

type MotionLaw = "first" | "second" | "third" | null;

function detectMotionLaw(text: string): MotionLaw {
  const normalized = text.toLowerCase().replace(/[’']/g, "");

  if (
    normalized.includes("third law") ||
    normalized.includes("3rd law") ||
    normalized.includes("तीसरा नियम") ||
    normalized.includes("तिसरा नियम") ||
    normalized.includes("तिसरा कायदा")
  ) {
    return "third";
  }
  if (
    normalized.includes("second law") ||
    normalized.includes("2nd law") ||
    normalized.includes("दूसरा नियम") ||
    normalized.includes("दुसरा नियम") ||
    normalized.includes("दुसरा कायदा")
  ) {
    return "second";
  }
  if (
    normalized.includes("first law") ||
    normalized.includes("1st law") ||
    normalized.includes("inertia") ||
    normalized.includes("जड़त्व") ||
    normalized.includes("जडत्व") ||
    normalized.includes("पहला नियम") ||
    normalized.includes("पहिला नियम") ||
    normalized.includes("पहिला कायदा")
  ) {
    return "first";
  }

  return null;
}

function getDemoTeachingReply(
  input: {
    setup: LessonPlanInput;
    messages: Array<{ role: "teacher" | "student"; text: string }>;
    question: string;
  },
): string {
  const { setup, messages, question } = input;
  const normalizedQuestion = question.toLowerCase();
  const conversationText = messages.map((message) => message.text).join(" ").toLowerCase();
  const motionLaw = detectMotionLaw(question) ?? detectMotionLaw(conversationText);
  const asksForExample =
    normalizedQuestion.includes("example") ||
    normalizedQuestion.includes("उदाहरण") ||
    normalizedQuestion.includes("मिसाल") ||
    normalizedQuestion.includes("example batao") ||
    normalizedQuestion.includes("example do") ||
    normalizedQuestion.includes("example dya") ||
    normalizedQuestion.includes("उदाहरण द्या");

  const replies: Record<LessonLanguage, string> = {
    English: motionLaw === "first" && asksForExample
      ? `Here is one example of Newton's First Law: when a bus stops suddenly, your body tends to keep moving forward until the seat belt or the seat stops you. That tendency to keep its motion is called inertia. What force stops the passenger?`
      : motionLaw === "first"
      ? `Newton's First Law is the law of inertia. An object stays at rest, or keeps moving at the same speed in a straight line, unless an unbalanced force acts on it. For example, a book stays on a table until you push it. Why does a passenger move forward when a bus brakes suddenly?`
      : motionLaw === "second" && asksForExample
      ? `Here is one example of Newton's Second Law: when you kick a football harder, it accelerates more. The force of your kick creates the acceleration, while a heavier ball would need more force for the same change in motion. Which part of this example shows the force?`
      : motionLaw === "second"
      ? `Newton's Second Law says that force, mass, and acceleration are connected by F = ma. In simple terms, a stronger push gives more acceleration, while a heavier object needs more force for the same acceleration. For example, an empty shopping cart speeds up more than a full cart when you push both with the same force. Does this relationship make sense with an example from your day?`
      : `For your question, "${question}", let’s connect the answer to ${setup.topic}. At a ${setup.level} level, start by identifying the main idea, then link it to one familiar example. What part of this idea would you like to unpack first?`,
    Hindi: motionLaw === "first" && asksForExample
      ? `न्यूटन के पहले नियम का एक उदाहरण देखें: बस अचानक रुकती है, तो आपका शरीर आगे बढ़ता रहता है, जब तक सीट बेल्ट या सीट आपको रोक न दे। गति को बनाए रखने की इस प्रवृत्ति को जड़त्व कहते हैं। यात्री को रोकने वाला बल कौन सा है?`
      : motionLaw === "first"
      ? `न्यूटन का पहला नियम जड़त्व का नियम है। कोई वस्तु स्थिर रहती है या सीधी रेखा में समान गति से चलती रहती है, जब तक उस पर कोई असंतुलित बल न लगे। जैसे, मेज़ पर रखी किताब तब तक नहीं हिलती जब तक आप उसे धक्का न दें। बस अचानक रुकने पर यात्री आगे क्यों झुकता है?`
      : motionLaw === "second" && asksForExample
      ? `न्यूटन के दूसरे नियम का एक उदाहरण देखें: जब आप फुटबॉल को ज़ोर से किक करते हैं, तो वह ज़्यादा त्वरण से आगे जाती है। आपके किक का बल त्वरण पैदा करता है, और भारी गेंद को उतना ही बदलाव देने के लिए ज़्यादा बल चाहिए। इस उदाहरण में बल कहाँ दिखाई दे रहा है?`
      : motionLaw === "second"
      ? `न्यूटन का दूसरा नियम बताता है कि बल, द्रव्यमान और त्वरण का संबंध F = ma से होता है। आसान शब्दों में, ज़्यादा धक्का देने पर त्वरण बढ़ता है, और भारी वस्तु को उतना ही त्वरण देने के लिए ज़्यादा बल चाहिए। जैसे, एक खाली शॉपिंग ट्रॉली उसी धक्के से भरी ट्रॉली से जल्दी गति पकड़ती है। क्या आप अपने रोज़मर्रा के जीवन का ऐसा उदाहरण बता सकते हैं?`
      : `आपके सवाल "${question}" का जवाब ${setup.topic} की मुख्य बात से जुड़ा है। ${setup.level} स्तर पर पहले मुख्य विचार पहचानें और फिर उसे एक परिचित उदाहरण से जोड़ें। इस विचार का कौन सा हिस्सा आपको और समझना है?`,
    Marathi: motionLaw === "first" && asksForExample
      ? `न्यूटनच्या पहिल्या नियमाचे एक उदाहरण पाहूया: बस अचानक थांबली, तर तुमचे शरीर पुढे जात राहते, जोपर्यंत सीट बेल्ट किंवा सीट तुम्हाला थांबवत नाही. हालचाल सुरू ठेवण्याच्या या प्रवृत्तीला जडत्व म्हणतात. प्रवाशाला थांबवणारे बल कोणते?`
      : motionLaw === "first"
      ? `न्यूटनचा पहिला नियम जडत्वाचा नियम आहे. एखादी वस्तू स्थिर असेल तर स्थिर राहते, किंवा सरळ रेषेत समान वेगाने चालत असेल तर तशीच चालत राहते, जोपर्यंत तिच्यावर असंतुलित बल लागू होत नाही. उदाहरणार्थ, तुम्ही ढकलल्याशिवाय टेबलवरील पुस्तक हलत नाही. बस अचानक थांबल्यावर प्रवासी पुढे का झुकतो?`
      : motionLaw === "second" && asksForExample
      ? `न्यूटनच्या दुसऱ्या नियमाचे एक उदाहरण पाहूया: फुटबॉलला जास्त जोरात किक मारल्यावर तो जास्त त्वरणाने पुढे जातो. तुमच्या किकचे बल त्वरण निर्माण करते; आणि जड चेंडूला तेवढाच बदल घडवण्यासाठी जास्त बल लागते. या उदाहरणात बल कुठे दिसते?`
      : motionLaw === "second"
      ? `न्यूटनचा दुसरा नियम बल, वस्तुमान आणि त्वरण यांचा संबंध F = ma असा सांगतो. सोप्या भाषेत, जास्त जोर लावल्यास त्वरण वाढते; आणि जड वस्तूला तेवढेच त्वरण देण्यासाठी जास्त बल लागते. उदाहरणार्थ, समान जोर लावल्यावर रिकामी खरेदीची ट्रॉली भरलेल्या ट्रॉलीपेक्षा लवकर वेग घेते. तुमच्या रोजच्या जीवनातील असे उदाहरण कोणते?`
      : `तुमच्या प्रश्नाचे उत्तर "${question}" हे ${setup.topic} मधील मुख्य कल्पनेशी जोडूया. ${setup.level} स्तरावर आधी मुख्य मुद्दा ओळखा आणि मग तो परिचित उदाहरणाशी जोडा. या कल्पनेतील कोणता भाग तुम्हाला अजून समजून घ्यायचा आहे?`,
    Hinglish: motionLaw === "first" && asksForExample
      ? `Newton's First Law ka ek example dekho: jab bus suddenly rukti hai, tumhara body aage move karta rehta hai, jab tak seat belt ya seat tumhe rok na de. Motion ko continue karne ki is tendency ko inertia kehte hain. Passenger ko rokne wala force kaunsa hai?`
      : motionLaw === "first"
      ? `Newton's First Law ko law of inertia kehte hain. Koi object rest mein hai to rest mein rehta hai, ya straight line mein same speed se move kar raha hai to waise hi move karta rehta hai, jab tak unbalanced force act na kare. Example: table par rakhi book tab tak nahi hilti jab tak tum use push na karo. Bus suddenly brake kare to passenger aage kyun jhukta hai?`
      : motionLaw === "second" && asksForExample
      ? `Newton's Second Law ka ek example dekho: jab tum football ko harder kick karte ho, ball zyada acceleration ke saath aage jaati hai. Tumhari kick ka force acceleration create karta hai, aur heavier ball ko same motion change ke liye zyada force chahiye. Is example mein force kahan dikh raha hai?`
      : motionLaw === "second"
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
  messages: Array<{ role: "teacher" | "student"; text: string }>;
  question: string;
}): string {
  const { setup, lesson, messages, question } = input;
  const conversation = messages.length
    ? messages.map((message) => `${message.role === "teacher" ? "AI Teacher" : "Student"}: ${message.text}`).join("\n")
    : "(No previous messages.)";

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

Previous conversation:
${conversation}

Student's exact question:
${question}

Response requirements:
- Answer that exact question first and stay focused on ${setup.topic}.
- Use the previous conversation to resolve short follow-ups such as "give one example", "why?", or "what about this?" instead of treating them as new unrelated questions.
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
  messages: Array<{ role: "teacher" | "student"; text: string }>;
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