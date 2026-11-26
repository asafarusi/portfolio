// All site copy lives here. Facts come from ABOUT_ME.md.
export const profile = {
  name: "Asaf Arusi",
  role: "AI Software Engineer",
  company: "Dig AI",
  base: "Giv'at Shmuel, Israel",
  email: "asafarusi2@gmail.com",
  links: {
    github: "https://github.com/asafarusi",
    linkedin: "https://www.linkedin.com/in/asafarusi",
    email: "mailto:asafarusi2@gmail.com",
  },
};

export const hero = {
  lede: "I build products end to end, and the AI that makes them feel effortless.",
};

// Lights up word by word as you scroll.
export const statement =
  "The interface you touch. The API behind it. The data underneath. And the intelligence that ties it all together. I care about every layer.";

export const now = {
  title: "Building at Dig AI.",
  body: "I work across the whole product, from the interface to the infrastructure, and the AI features that run through it. The portal I work on is used by real people every day.",
  aside: "Code review is me arguing with last month’s me. Last month’s me has some explaining to do.",
  facts: [
    { big: "Full stack", small: "Interface, API, data and infrastructure." },
    { big: "AI", small: "Built into the product, not bolted on." },
    { big: "BSc", small: "Computer Science, HIT." },
  ],
};

// Projects. Set status to "live" and add links when one ships.
export type Project = {
  title: string;
  line: string;
  tags: string[];
  hue: number; // tint of the card's soft light
  status: "soon" | "live";
  github?: string;
  live?: string;
};

export const work: Project[] = [
  {
    title: "Overclock",
    line: "An AI agent that runs your dev workflow while you sleep.",
    tags: ["AI agents", "TypeScript", "Node"],
    hue: 215,
    status: "soon",
  },
  {
    title: "Signal / Noise",
    line: "A real-time pipeline that turns messy data into decisions.",
    tags: ["Python", "Postgres", "GCP"],
    hue: 32,
    status: "soon",
  },
  {
    title: "Nullpointer FC",
    line: "Soccer analytics and machine learning. Who should have scored.",
    tags: ["ML", "React", "Data viz"],
    hue: 150,
    status: "soon",
  },
];

export const stack: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React", "TypeScript", "JavaScript"] },
  { group: "Backend & data", items: ["Node.js", "PostgreSQL", "SQL", "Python"] },
  { group: "Systems", items: ["C", "C++", "Java"] },
  { group: "Cloud", items: ["AWS", "GCP"] },
];

export const contact = {
  title: "Let’s build something.",
  body: "Hiring, building something ambitious, or just want to talk football. My inbox is open.",
};
