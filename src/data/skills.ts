// Skill tree: nodes sit on a 1000 x 640 canvas, and edges join node ids.
export type SkillNode = { id: string; label: string; x: number; y: number; group: Group; core?: boolean };
export type Group = "core" | "front" | "back" | "systems" | "cloud";

export const groups: Record<Group, { name: string; color: string }> = {
  core: { name: "CORE", color: "var(--acid)" },
  front: { name: "FRONTEND", color: "var(--cyan)" },
  back: { name: "BACKEND / DATA", color: "var(--acid)" },
  systems: { name: "SYSTEMS", color: "var(--magenta)" },
  cloud: { name: "CLOUD", color: "var(--cyan)" },
};

export const nodes: SkillNode[] = [
  { id: "core", label: "ASAF.core", x: 500, y: 320, group: "core", core: true },

  { id: "react", label: "React", x: 190, y: 120, group: "front" },
  { id: "ts", label: "TypeScript", x: 330, y: 70, group: "front" },
  { id: "js", label: "JavaScript", x: 120, y: 260, group: "front" },

  { id: "node", label: "Node.js", x: 680, y: 80, group: "back" },
  { id: "pg", label: "PostgreSQL", x: 840, y: 170, group: "back" },
  { id: "sql", label: "SQL", x: 900, y: 320, group: "back" },
  { id: "py", label: "Python", x: 330, y: 470, group: "back" },

  { id: "c", label: "C", x: 140, y: 470, group: "systems" },
  { id: "cpp", label: "C++", x: 230, y: 580, group: "systems" },
  { id: "java", label: "Java", x: 470, y: 590, group: "systems" },

  { id: "aws", label: "AWS", x: 700, y: 540, group: "cloud" },
  { id: "gcp", label: "GCP", x: 860, y: 480, group: "cloud" },
];

export const edges: [string, string][] = [
  ["core", "react"], ["core", "ts"], ["core", "node"], ["core", "py"],
  ["core", "pg"], ["core", "c"], ["core", "aws"], ["core", "java"],
  ["ts", "react"], ["js", "react"], ["js", "ts"], ["ts", "node"],
  ["node", "pg"], ["pg", "sql"], ["sql", "gcp"], ["node", "aws"],
  ["aws", "gcp"], ["py", "aws"], ["c", "cpp"], ["cpp", "java"],
  ["py", "c"], ["java", "aws"], ["core", "gcp"], ["core", "js"],
];
