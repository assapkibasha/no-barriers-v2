export type Audience = "Learner" | "Family" | "Educator";

export const audiences: { name: Audience; description: string }[] = [
  { name: "Learner", description: "Learning on my own" },
  { name: "Family", description: "Learning alongside someone" },
  { name: "Educator", description: "Supporting others as they learn" },
];

export const isAudience = (value: unknown): value is Audience => audiences.some(audience => audience.name === value);
export const registerHref = (audience?: Audience) => (audience ? `/register?role=${audience}` : "/register");
