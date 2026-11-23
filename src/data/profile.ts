// All copy lives here. Facts come from ABOUT_ME.md.
export const profile = {
  name: "Asaf Arusi",
  first: "ASAF",
  last: "ARUSI",
  role: "AI Software Engineer",
  company: "Dig AI",
  base: "Giv'at Shmuel, IL",
  tagline: ["Serious.", "Slightly", "unhinged."],
  email: "asafarusi2@gmail.com",
  links: {
    github: "https://github.com/asafarusi",
    linkedin: "https://www.linkedin.com/in/asafarusi",
    email: "mailto:asafarusi2@gmail.com",
  },
  site: "https://asafarusi.co.il",
};

export const bootLines: { text: string; status?: "ok" | "fail" | "warn" }[] = [
  { text: "init asaf.exe --mode=overdrive" },
  { text: "mounting /brain", status: "ok" },
  { text: "loading react · typescript · node · postgres", status: "ok" },
  { text: "loading c · c++ · python · java", status: "ok" },
  { text: "spawning ai agents", status: "ok" },
  { text: "resolving merge conflicts: 0 (team size: 1)", status: "ok" },
  { text: "sanity check", status: "fail" },
  { text: "continuing anyway", status: "warn" },
];

export const lore = [
  "I build products end to end: the UI you click, the API behind it, the database under that, and the AI that makes the whole thing smarter than it has any right to be.",
  "Right now I'm the only software engineer at Dig AI. That makes me the frontend team, the backend team, DevOps and on-call. Standups are short. Code review is me arguing with last month's me, and last month's me has some explaining to do.",
  "CS at HIT. I like hard problems, boring infrastructure and fast feedback loops. I treat production like a boss fight: learn the patterns, take the hits, ship anyway.",
];

export const idcard = [
  { k: "TRAINING", v: "BSc CS · HIT" },
  { k: "SPECIALTY", v: "Full stack + AI" },
  { k: "CURRENT", v: "AI SWE · Dig AI", hot: true },
];

export const stats: { label: string; value: number; note: string }[] = [
  { label: "CODE", value: 92, note: "TypeScript to C. Fears neither." },
  { label: "DEBUGGING", value: 97, note: "reads stack traces recreationally" },
  { label: "SHIP SPEED", value: 95, note: "idea → prod, same day" },
  { label: "CHAOS", value: 100, note: "contained. in production. mostly." },
];

export const inventory = [
  { id: "controller", name: "Controller", desc: "Gaming. I play the way I debug: scout the map, then speedrun it." },
  { id: "ball", name: "Football", desc: "Soccer. Click it. I dare you." },
  { id: "headphones", name: "Headphones", desc: "Music, always on. Builds feel faster with bass. Unbenchmarked, but I stand by it." },
] as const;

export const quest = {
  title: "AI Software Engineer",
  company: "Dig AI",
  since: "NOW",
  summary:
    "The only software engineer at a fast-moving AI startup. I architect, build, ship and run the portal real users log into every day. When something breaks at 3 a.m., git blame is a very short conversation.",
  objectives: [
    { text: "Architect the platform from zero", done: true },
    { text: "Ship the portal to real users", done: true },
    { text: "Wire AI into the product, not just the pitch deck", done: true },
    { text: "Be the entire engineering department", done: true },
    { text: "Sleep 8 hours", done: false },
  ],
  ticker: ["FRONTEND", "BACKEND", "INFRA", "AI", "DATABASES", "DEVOPS", "ON-CALL", "WRITES TESTS (REALLY)", "SHIPS ON FRIDAYS"],
};
