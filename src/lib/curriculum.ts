// Provisional curriculum, based on the existing RSL program. Phase 3 moves it into the database.
export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Lesson = { id: number; slug: string; level: Level; title: string; description: string };

export const levels: Level[] = ["Beginner", "Intermediate", "Advanced"];

export const curriculum: Lesson[] = [
  { id: 1, slug: "introduction", level: "Beginner", title: "Introduction to Rwandan Sign Language", description: "Meet the language and the community." },
  { id: 2, slug: "alphabet", level: "Beginner", title: "The sign language alphabet", description: "Practise the handshapes that form your foundation." },
  { id: 3, slug: "numbers", level: "Beginner", title: "Numbers", description: "Build confidence with numbers in everyday conversation." },
  { id: 4, slug: "greetings", level: "Beginner", title: "Greetings and introductions", description: "Start your first conversation." },
  { id: 5, slug: "family", level: "Beginner", title: "Family and relationships", description: "Talk about the people in your life." },
  { id: 6, slug: "everyday-expressions", level: "Beginner", title: "Everyday expressions", description: "Bring your first signs together." },
  { id: 7, slug: "building-sentences", level: "Intermediate", title: "Building sentences", description: "Connect signs to express more." },
  { id: 8, slug: "asking-questions", level: "Intermediate", title: "Asking questions", description: "Keep a conversation going." },
  { id: 9, slug: "complex-conversations", level: "Advanced", title: "Complex conversations", description: "Explore more detailed communication." },
];

export const lessonById = (id: number) => curriculum.find(lesson => lesson.id === id);
export const lessonBySlug = (slug: string) => curriculum.find(lesson => lesson.slug === slug);
export const lessonsInLevel = (level: Level) => curriculum.filter(lesson => lesson.level === level);
export const lessonHref = (lesson: Lesson) => `/learn/${lesson.slug}`;
