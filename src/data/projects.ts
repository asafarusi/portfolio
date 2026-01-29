
export type Project = {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  imgset: string[];
  links: {
    github: string;
    live: string;
  };
};

export const projects: Project[] = [
  {
    id: 1,
    title: "First Project",
    description: "An example project.",
    image: "/imgs/exampl-project-img.png",
    imgset: ["/imgs/exampl-project-img.png", "/imgs/exampl-project-img.png"],
    tags: ["tag-1", "tag-2", "tag-3", "tag-4"],
    links: {
      github: "https://github.com/xteeque",
      live: "https://github.com/xteeque",
    },
  },
  {
    id: 2,
    title: "First Project",
    description: "An example project.",
    image: "/imgs/exampl-project-img.png",
    imgset: ["/imgs/exampl-project-img.png", "/imgs/exampl-project-img.png"],
    tags: ["tag-1", "tag-2", "tag-3", "tag-4"],
    links: {
      github: "https://github.com/xteeque",
      live: "https://github.com/xteeque",
    },
  },
];
