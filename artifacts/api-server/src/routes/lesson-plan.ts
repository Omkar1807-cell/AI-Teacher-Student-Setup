import { Router, type IRouter } from "express";
import {
  GenerateLessonPlanBody,
  GenerateLessonPlanResponse,
  type LessonPlan,
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

const demoCopy: Record<
  LessonLanguage,
  {
    title: string;
    summary: string;
    objectives: string[];
    concepts: string[];
    examples: string[];
    questions: string[];
    assessmentPlan: string;
    sections: Record<
      "5 minutes" | "20 minutes" | "60 minutes",
      Array<{ title: string; minutes: number; description: string }>
    >;
  }
> = {
  English: {
    title: "Newton's Laws: the essential guide",
    summary:
      "A focused sample lesson that connects Newton's three laws to the motion you see every day.",
    objectives: [
      "Describe what a force is and how it changes motion.",
      "Explain Newton's three laws in your own words.",
      "Use a simple force diagram to reason about an everyday example.",
    ],
    concepts: [
      "Force and motion",
      "Newton's First Law: inertia",
      "Newton's Second Law: F = ma",
      "Newton's Third Law: action and reaction",
    ],
    examples: [
      "A book stays on a table until a push gives it a net force.",
      "The same push accelerates an empty cart more than a loaded cart.",
      "A swimmer moves forward by pushing water backward.",
    ],
    questions: [
      "Why does a passenger move forward when a bus stops suddenly?",
      "What happens to acceleration if the same force acts on twice the mass?",
      "Name the action and reaction forces when you jump.",
    ],
    assessmentPlan:
      "Finish with a three-question check: explain inertia, solve one F = ma example, and identify an action-reaction pair. A strong response connects each answer to a real situation.",
    sections: {
      "5 minutes": [
        { title: "Quick picture", minutes: 1, description: "Connect force and motion to one familiar example." },
        { title: "Three laws", minutes: 2, description: "Meet the core idea behind each of Newton's laws." },
        { title: "Check your understanding", minutes: 2, description: "Answer one quick question and name an action-reaction pair." },
      ],
      "20 minutes": [
        { title: "Warm-up", minutes: 3, description: "Start with a bus, a ball, and what their motion tells us." },
        { title: "The three laws", minutes: 7, description: "Build the ideas in order, from inertia to action and reaction." },
        { title: "Work through examples", minutes: 6, description: "Apply the laws to a cart, a book, and a swimmer." },
        { title: "Quick assessment", minutes: 4, description: "Use three short questions to check the main ideas." },
      ],
      "60 minutes": [
        { title: "Warm-up and prior knowledge", minutes: 8, description: "Explore what students already notice about moving objects." },
        { title: "Newton's First Law", minutes: 12, description: "Understand inertia through stops, starts, and balanced forces." },
        { title: "Newton's Second Law", minutes: 15, description: "Use F = ma and compare force, mass, and acceleration." },
        { title: "Newton's Third Law", minutes: 15, description: "Find action-reaction pairs in sports and everyday movement." },
        { title: "Review and assessment", minutes: 10, description: "Bring the laws together with examples and a short check." },
      ],
    },
  },
  Hindi: {
    title: "न्यूटन के नियम: एक ज़रूरी परिचय",
    summary:
      "एक छोटा नमूना पाठ जो न्यूटन के तीनों नियमों को रोज़मर्रा की गति से जोड़ता है।",
    objectives: [
      "समझना कि बल क्या है और वह गति को कैसे बदलता है।",
      "न्यूटन के तीनों नियमों को अपने शब्दों में समझाना।",
      "किसी रोज़मर्रा के उदाहरण के लिए सरल बल आरेख बनाना।",
    ],
    concepts: ["बल और गति", "पहला नियम: जड़त्व", "दूसरा नियम: F = ma", "तीसरा नियम: क्रिया और प्रतिक्रिया"],
    examples: ["बस रुकने पर यात्री आगे की ओर क्यों झुकता है?", "खाली गाड़ी पर वही बल अधिक त्वरण देता है।", "तैराक पानी को पीछे धकेलकर आगे बढ़ता है।"],
    questions: ["बस अचानक रुकने पर यात्री आगे क्यों जाता है?", "द्रव्यमान दोगुना हो तो समान बल पर त्वरण पर क्या असर होगा?", "कूदते समय क्रिया और प्रतिक्रिया बल बताइए।"],
    assessmentPlan: "अंत में तीन सवालों की जाँच करें: जड़त्व समझाइए, F = ma का एक सवाल हल कीजिए और क्रिया-प्रतिक्रिया की एक जोड़ी पहचानिए।",
    sections: {
      "5 minutes": [
        { title: "एक आसान तस्वीर", minutes: 1, description: "बल और गति को एक परिचित उदाहरण से जोड़ें।" },
        { title: "तीन नियम", minutes: 2, description: "हर नियम के पीछे का मुख्य विचार जानें।" },
        { title: "समझ की जाँच", minutes: 2, description: "एक छोटा सवाल हल करें और क्रिया-प्रतिक्रिया की जोड़ी बताएं।" },
      ],
      "20 minutes": [
        { title: "शुरुआत", minutes: 3, description: "बस, गेंद और उनकी गति से शुरुआत करें।" },
        { title: "तीनों नियम", minutes: 7, description: "जड़त्व से क्रिया-प्रतिक्रिया तक विचार बनाएं।" },
        { title: "उदाहरण", minutes: 6, description: "गाड़ी, किताब और तैराक पर नियम लगाएं।" },
        { title: "छोटा मूल्यांकन", minutes: 4, description: "तीन छोटे सवालों से मुख्य बातें जाँचें।" },
      ],
      "60 minutes": [
        { title: "शुरुआत और पुरानी जानकारी", minutes: 8, description: "चलती वस्तुओं के बारे में पहले से पता बातें खोजें।" },
        { title: "पहला नियम", minutes: 12, description: "रुकने और चलने के उदाहरणों से जड़त्व समझें।" },
        { title: "दूसरा नियम", minutes: 15, description: "F = ma से बल, द्रव्यमान और त्वरण की तुलना करें।" },
        { title: "तीसरा नियम", minutes: 15, description: "खेल और रोज़मर्रा की गति में क्रिया-प्रतिक्रिया खोजें।" },
        { title: "दोहराव और मूल्यांकन", minutes: 10, description: "उदाहरणों और छोटे टेस्ट से नियमों को जोड़ें।" },
      ],
    },
  },
  Marathi: {
    title: "न्यूटनचे नियम: आवश्यक मार्गदर्शक",
    summary:
      "न्यूटनचे तीन नियम रोजच्या जीवनातील हालचालींशी जोडणारा हा एक छोटा नमुना धडा आहे.",
    objectives: [
      "बल म्हणजे काय आणि त्यामुळे गती कशी बदलते हे सांगणे.",
      "न्यूटनचे तीन नियम स्वतःच्या शब्दांत समजावणे.",
      "दैनंदिन उदाहरणासाठी सोपे बल-आरेख वापरणे.",
    ],
    concepts: ["बल आणि गती", "पहिला नियम: जडत्व", "दुसरा नियम: F = ma", "तिसरा नियम: क्रिया आणि प्रतिक्रिया"],
    examples: ["बस अचानक थांबल्यावर प्रवासी पुढे का झुकतो?", "समान बलाने रिकामी गाडी अधिक वेगाने गती घेते.", "पोहणारा पाणी मागे ढकलून पुढे जातो."],
    questions: ["बस थांबल्यावर प्रवासी पुढे का जातो?", "समान बल आणि दुप्पट वस्तुमान असल्यास त्वरणात काय बदल होईल?", "उडी मारताना क्रिया आणि प्रतिक्रिया बलांची जोडी सांगा."],
    assessmentPlan: "शेवटी तीन प्रश्नांची छोटी चाचणी घ्या: जडत्व समजवा, F = ma चे एक उदाहरण सोडवा आणि क्रिया-प्रतिक्रियेची जोडी ओळखा.",
    sections: {
      "5 minutes": [
        { title: "सोपे उदाहरण", minutes: 1, description: "बल आणि गती एका परिचित उदाहरणाशी जोडा." },
        { title: "तीन नियम", minutes: 2, description: "प्रत्येक नियमामागची मुख्य कल्पना समजून घ्या." },
        { title: "समज तपासा", minutes: 2, description: "एक छोटा प्रश्न सोडवा आणि क्रिया-प्रतिक्रिया सांगा." },
      ],
      "20 minutes": [
        { title: "सुरुवात", minutes: 3, description: "बस, चेंडू आणि त्यांच्या गतीपासून सुरुवात करा." },
        { title: "तीन नियम", minutes: 7, description: "जडत्वापासून क्रिया-प्रतिक्रियेपर्यंत कल्पना बांधा." },
        { title: "उदाहरणे", minutes: 6, description: "गाडी, पुस्तक आणि पोहणाऱ्यावर नियम वापरा." },
        { title: "छोटी चाचणी", minutes: 4, description: "तीन प्रश्नांनी मुख्य कल्पना तपासा." },
      ],
      "60 minutes": [
        { title: "सुरुवात आणि आधीचे ज्ञान", minutes: 8, description: "हालचालींबद्दल विद्यार्थ्यांना आधी काय माहिती आहे ते पाहा." },
        { title: "पहिला नियम", minutes: 12, description: "थांबणे आणि सुरू होण्याच्या उदाहरणांतून जडत्व समजा." },
        { title: "दुसरा नियम", minutes: 15, description: "F = ma वापरून बल, वस्तुमान आणि त्वरणाची तुलना करा." },
        { title: "तिसरा नियम", minutes: 15, description: "खेळ आणि रोजच्या हालचालींमध्ये क्रिया-प्रतिक्रिया शोधा." },
        { title: "उजळणी आणि चाचणी", minutes: 10, description: "उदाहरणे आणि छोट्या चाचणीने नियम एकत्र करा." },
      ],
    },
  },
  Hinglish: {
    title: "Newton's Laws: easy everyday guide",
    summary:
      "Ek focused sample lesson jo Newton ke teen laws ko daily life ki movement se connect karta hai.",
    objectives: [
      "Samajhna ki force kya hota hai aur motion kaise change karta hai.",
      "Newton ke teen laws ko apne words mein explain karna.",
      "Ek everyday example ke liye simple force diagram banana.",
    ],
    concepts: ["Force aur motion", "First Law: inertia", "Second Law: F = ma", "Third Law: action aur reaction"],
    examples: ["Bus suddenly rukti hai to passenger aage kyun jhukta hai?", "Same push se empty cart loaded cart se zyada accelerate hoti hai.", "Swimmer paani ko peeche push karke aage move karta hai."],
    questions: ["Bus stop hone par passenger aage kyun jaata hai?", "Same force aur double mass ho to acceleration par kya effect hoga?", "Jump karte waqt action-reaction forces ki pair batao."],
    assessmentPlan: "End mein teen-question check karein: inertia explain karein, F = ma ka ek example solve karein, aur action-reaction pair identify karein.",
    sections: {
      "5 minutes": [
        { title: "Quick picture", minutes: 1, description: "Force aur motion ko ek familiar example se connect karo." },
        { title: "Teen laws", minutes: 2, description: "Har law ke peeche ka main idea samjho." },
        { title: "Understanding check", minutes: 2, description: "Ek quick question solve karo aur action-reaction pair batao." },
      ],
      "20 minutes": [
        { title: "Warm-up", minutes: 3, description: "Bus, ball aur unki movement se start karo." },
        { title: "Teen laws", minutes: 7, description: "Inertia se action-reaction tak ideas build karo." },
        { title: "Examples", minutes: 6, description: "Cart, book aur swimmer par laws apply karo." },
        { title: "Quick assessment", minutes: 4, description: "Teen short questions se main ideas check karo." },
      ],
      "60 minutes": [
        { title: "Warm-up aur prior knowledge", minutes: 8, description: "Moving objects ke baare mein student kya notice karta hai, explore karo." },
        { title: "First Law", minutes: 12, description: "Stops, starts aur balanced forces se inertia samjho." },
        { title: "Second Law", minutes: 15, description: "F = ma se force, mass aur acceleration compare karo." },
        { title: "Third Law", minutes: 15, description: "Sports aur daily movement mein action-reaction pairs dekho." },
        { title: "Review aur assessment", minutes: 10, description: "Examples aur short check se teenon laws connect karo." },
      ],
    },
  },
};

function getDemoPlan(input: LessonPlanInput): LessonPlan {
  const copy = demoCopy[input.language];
  const levelDescription =
    input.level === "Beginner"
      ? "starting with the essentials"
      : input.level === "Intermediate"
        ? "building on what you already know"
        : "going deeper into the reasoning";

  return {
    title: copy.title,
    summary: `${copy.summary} This demo is ${levelDescription} and is paced for ${input.availableTime}.`,
    objectives: copy.objectives,
    concepts: copy.concepts,
    teachingOrder: copy.sections[input.availableTime],
    examples: copy.examples,
    questions: copy.questions,
    assessmentPlan: copy.assessmentPlan,
  };
}

function getGeminiPrompt(input: LessonPlanInput): string {
  return `You are an expert, encouraging teacher. Create a personalized lesson plan for a student.

Student setup:
- Topic: ${input.topic}
- Level: ${input.level}
- Language: ${input.language}
- Available time: ${input.availableTime}
- Learning goal: ${input.learningGoal}

Return ONLY valid JSON matching this exact shape:
{
  "title": "short lesson title",
  "summary": "2-3 sentence encouraging overview",
  "objectives": ["3-5 measurable learning objectives"],
  "concepts": ["3-6 concepts in a sensible order"],
  "teachingOrder": [
    { "title": "section name", "minutes": 5, "description": "what the teacher will cover" }
  ],
  "examples": ["2-4 concrete examples"],
  "questions": ["3-5 practice or reflection questions"],
  "assessmentPlan": "a clear final assessment plan"
}

Requirements:
- Write all learner-facing content in ${input.language}. Keep formula and standard scientific terms where useful.
- Respect the student's ${input.level} level and stated goal.
- Make all teachingOrder minutes positive numbers that add up to exactly ${input.availableTime}.
- Keep the plan achievable in the available time.
- Do not include markdown, code fences, commentary, or extra keys.`;
}

async function generateWithGemini(input: LessonPlanInput): Promise<LessonPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: getGeminiPrompt(input) }] }],
      generationConfig: {
        temperature: 0.55,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Gemini returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty lesson plan");
  }

  const cleanJson = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const plan = JSON.parse(cleanJson) as unknown;
  return GenerateLessonPlanResponse.shape.plan.parse(plan);
}

router.post("/lesson-plan", async (req, res) => {
  const parsed = GenerateLessonPlanBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "Invalid lesson plan request");
    res.status(400).json({ error: "Please provide valid student setup choices." });
    return;
  }

  const input = parsed.data;
  if (!process.env.GEMINI_API_KEY) {
    res.json(
      GenerateLessonPlanResponse.parse({
        mode: "demo",
        plan: getDemoPlan(input),
      }),
    );
    return;
  }

  try {
    const plan = await generateWithGemini(input);
    res.json(GenerateLessonPlanResponse.parse({ mode: "gemini", plan }));
  } catch (error) {
    req.log.error({ err: error }, "Lesson plan generation failed");
    res.status(502).json({
      error: "We couldn't create your lesson plan right now. Please try again.",
    });
  }
});

export default router;