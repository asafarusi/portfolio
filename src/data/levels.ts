// LEVELS = projects. Fill these in. You don't need to touch any component.
//   status "locked"   → classified card, shows the codename and a teaser
//   status "unlocked" → full card with blurb, tags and links
export type Level = {
  id: string;
  codename: string;
  teaser: string; // shown while locked
  blurb: string; // shown when unlocked
  tags: string[];
  github?: string;
  live?: string;
  status: "locked" | "unlocked";
};

export const levels: Level[] = [
  {
    id: "01",
    codename: "OVERCLOCK",
    teaser: "An AI agent that runs your dev workflow while you sleep.",
    blurb: "",
    tags: ["AI AGENTS", "TYPESCRIPT", "NODE"],
    status: "locked",
  },
  {
    id: "02",
    codename: "SIGNAL//NOISE",
    teaser: "A real-time pipeline that turns messy data into decisions.",
    blurb: "",
    tags: ["PYTHON", "POSTGRES", "GCP"],
    status: "locked",
  },
  {
    id: "03",
    codename: "NULLPOINTER FC",
    teaser: "Soccer analytics + ML. Who should've scored.",
    blurb: "",
    tags: ["ML", "REACT", "DATA VIZ"],
    status: "locked",
  },
];
