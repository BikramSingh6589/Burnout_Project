export type TopicClassification = "ALLOWED" | "RESTRICTED";

export const RESTRICTED_TOPIC_RESPONSE = `I am a Student Wellness and Burnout Assistant.

I can help with:

• Burnout recovery
• Stress management
• Academic wellbeing
• Study habits
• Productivity
• Time management
• Motivation
• Sleep improvement
• Career guidance for students

I cannot assist with this topic.

Please ask a question related to student wellness, burnout, studies, productivity, or career development.`;

/** Topics the assistant is permitted to discuss. */
export const ALLOWED_TOPICS = [
  "Burnout prevention, recovery, symptoms, causes, and warning signs",
  "Stress and mental wellness (academic stress, exam stress, anxiety, fatigue)",
  "Productivity (focus, concentration, time management, procrastination, habits)",
  "Study habits (planning, revision, routines, consistency, discipline)",
  "Sleep and lifestyle wellness (sleep quality, routines, screen time, schedules)",
  "Student career guidance (career path, placement anxiety, goals, skill planning)",
] as const;

/** Topics the assistant must refuse. */
export const RESTRICTED_TOPICS = [
  "Programming and coding (languages, frameworks, debugging, algorithms, DSA, system design, SQL)",
  "General knowledge (weather, politics, history, geography, trivia, current affairs, prices)",
  "Entertainment (movies, celebrities, sports, music, TV shows)",
  "Lifestyle unrelated to students (cooking, recipes, fashion, shopping, travel, cars, crypto, stocks)",
] as const;

const ALLOWED_KEYWORDS = [
  "burnout",
  "burn out",
  "burn-out",
  "wellness",
  "wellbeing",
  "well-being",
  "stress",
  "stressed",
  "stressful",
  "anxiety",
  "anxious",
  "overwhelmed",
  "overwhelm",
  "exhausted",
  "exhaustion",
  "fatigue",
  "fatigued",
  "mental health",
  "mental wellness",
  "emotional",
  "emotionally",
  "pressure",
  "exam",
  "exams",
  "test",
  "tests",
  "midterm",
  "finals",
  "study",
  "studying",
  "revision",
  "revise",
  "homework",
  "assignment",
  "coursework",
  "productivity",
  "productive",
  "procrastinat",
  "focus",
  "concentration",
  "concentrate",
  "distract",
  "time management",
  "schedule",
  "routine",
  "habit",
  "motivation",
  "motivated",
  "unmotivated",
  "sleep",
  "insomnia",
  "tired",
  "rest",
  "nap",
  "screen time",
  "break",
  "breaks",
  "pomodoro",
  "career",
  "placement",
  "internship",
  "job search",
  "resume",
  "interview",
  "goal",
  "goals",
  "academic",
  "semester",
  "college",
  "university",
  "student",
  "class",
  "lecture",
  "learning",
  "mindfulness",
  "meditation",
  "relax",
  "relaxation",
  "self-care",
  "self care",
  "cope",
  "coping",
  "balance",
  "work-life",
  "deadline",
  "deadlines",
  "overwork",
  "overworking",
  "hopeless",
  "giving up",
  "can't cope",
  "cant cope",
  "feeling low",
  "feeling down",
  "burned out",
  "burnt out",
];

const RESTRICTED_KEYWORDS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "golang",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "react",
  "reactjs",
  "node.js",
  "nodejs",
  "express",
  "mongodb",
  "postgres",
  "mysql",
  "sql query",
  "sql queries",
  "jwt",
  "oauth",
  "graphql",
  "rest api",
  "api endpoint",
  "algorithm",
  "algorithms",
  "data structure",
  "data structures",
  "system design",
  "leetcode",
  "hackerrank",
  "codewars",
  "debug",
  "debugging",
  "compile",
  "compiler",
  "syntax error",
  "write code",
  "write a function",
  "write a program",
  "programming",
  "source code",
  "git commit",
  "pull request",
  "docker",
  "kubernetes",
  "terraform",
  "aws lambda",
  "azure",
  "weather",
  "forecast",
  "temperature",
  "gold price",
  "silver price",
  "stock market",
  "stock price",
  "crypto",
  "cryptocurrency",
  "bitcoin",
  "ethereum",
  "politics",
  "political",
  "election",
  "president",
  "prime minister",
  "history of",
  "world war",
  "geography",
  "capital of",
  "who invented",
  "science trivia",
  "current affairs",
  "news headline",
  "movie",
  "movies",
  "film",
  "films",
  "celebrity",
  "celebrities",
  "actor",
  "actress",
  "cricket",
  "football",
  "soccer",
  "basketball",
  "tennis",
  "sports score",
  "ipl",
  "premier league",
  "nba",
  "music album",
  "song lyrics",
  "tv show",
  "tv series",
  "netflix series",
  "recipe",
  "recipes",
  "cooking",
  "cook ",
  "bake ",
  "baking",
  "fashion",
  "shopping",
  "travel guide",
  "vacation spot",
  "tourist",
  "car review",
  "automobile",
  "motorcycle",
];

const CODING_INTENT_PATTERNS = [
  /\b(write|debug|fix|implement|create|build|code|program|develop)\b/i,
  /\bhow (?:do|can|to) (?:i )?(?:write|debug|fix|implement|code|program|build)\b/i,
  /\b(?:explain|what is) (?:the )?(?:code|function|algorithm|syntax)\b/i,
  /\b(?:sql|regex|api|endpoint|component|class|method)\b.*\b(?:example|implement|write|create)\b/i,
  /\b(?:implement|solve) (?:this|a|an|the) (?:problem|challenge|leetcode)\b/i,
];

const GREETING_PATTERNS = [
  /^(?:hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|ok|okay)\b/i,
  /^how are you\b/i,
];

const GENERAL_KNOWLEDGE_PATTERNS = [
  /\btell me about\b/i,
  /\bwho (?:was|is)\b/i,
  /\bwhat (?:was|is) the capital\b/i,
  /\bwhen did\b/i,
  /\bhistory of\b/i,
  /\bexplain (?:the )?(?:concept|theory|physics|chemistry|biology)\b/i,
];

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const matchesKeyword = (text: string, keyword: string): boolean => {
  if (keyword.includes(" ")) {
    return text.includes(keyword);
  }
  return new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(text);
};

const containsKeyword = (text: string, keywords: readonly string[]): boolean =>
  keywords.some((keyword) => matchesKeyword(text, keyword));

const hasWellnessContext = (text: string): boolean => containsKeyword(text, ALLOWED_KEYWORDS);

const hasCodingIntent = (text: string): boolean =>
  CODING_INTENT_PATTERNS.some((pattern) => pattern.test(text));

const hasGeneralKnowledgeIntent = (text: string): boolean =>
  GENERAL_KNOWLEDGE_PATTERNS.some((pattern) => pattern.test(text));

const hasRestrictedSignal = (text: string): boolean => containsKeyword(text, RESTRICTED_KEYWORDS);

const hasAllowedSignal = (text: string): boolean => containsKeyword(text, ALLOWED_KEYWORDS);

/**
 * Classifies a user message as ALLOWED or RESTRICTED before any LLM call.
 * Restricted messages should receive RESTRICTED_TOPIC_RESPONSE without calling Groq.
 */
export const classifyTopic = (message: string): TopicClassification => {
  const normalized = message.toLowerCase().trim();
  if (!normalized) {
    return "RESTRICTED";
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "ALLOWED";
  }

  if (hasCodingIntent(normalized)) {
    return "RESTRICTED";
  }

  if (hasGeneralKnowledgeIntent(normalized) && !hasAllowedSignal(normalized)) {
    return "RESTRICTED";
  }

  const restricted = hasRestrictedSignal(normalized);
  const allowed = hasAllowedSignal(normalized);
  const wellnessContext = hasWellnessContext(normalized);

  if (restricted && !wellnessContext) {
    return "RESTRICTED";
  }

  if (allowed) {
    return "ALLOWED";
  }

  if (restricted && wellnessContext) {
    return "ALLOWED";
  }

  return "ALLOWED";
};

export const isRestrictedTopic = (message: string): boolean =>
  classifyTopic(message) === "RESTRICTED";
