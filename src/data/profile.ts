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
  { text: "linking design.dll (IDF build)", status: "ok" },
  { text: "spawning ai agents", status: "ok" },
  { text: "sanity check", status: "fail" },
  { text: "continuing anyway", status: "warn" },
];

export const lore = [
  "Started as a graphic designer in the IDF, pushing pixels until the pixels started pushing back.",
  "Then he learned to make interfaces that think. CS at HIT, then a lot of late nights, then production.",
  "Now he's the only software engineer at Dig AI. Frontend, backend, infra, and the AI on top. Party size: 1.",
];

export const stats: { label: string; value: number; note: string }[] = [
  { label: "CODE", value: 92, note: "full stack → bare metal" },
  { label: "DESIGN", value: 88, note: "ex-IDF graphic designer" },
  { label: "SHIP SPEED", value: 95, note: "solo engineer. no excuses" },
  { label: "CHAOS", value: 100, note: "controlled. mostly" },
];

export const inventory = [
  { id: "controller", name: "Controller", desc: "Gaming. Strategy first, then speedrun the problem." },
  { id: "ball", name: "Football", desc: "Soccer. Click it. Go on." },
  { id: "headphones", name: "Headphones", desc: "Music. Always on. Code compiles faster with bass." },
] as const;

export const quest = {
  title: "AI Software Engineer",
  company: "Dig AI",
  since: "NOW",
  summary:
    "The only software engineer at a fast-moving AI startup. I design, build, ship and run the portal real users log into every day, end to end.",
  objectives: [
    { text: "Architect the platform from zero", done: true },
    { text: "Ship the portal to real users", done: true },
    { text: "Wire AI into the product, not just the pitch deck", done: true },
    { text: "Be the entire engineering department", done: true },
    { text: "Sleep 8 hours", done: false },
  ],
  ticker: ["FRONTEND", "BACKEND", "INFRA", "AI", "DATABASES", "DEVOPS", "ON-CALL", "SHIPS ON FRIDAYS"],
};
