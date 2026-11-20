// Local project showcase data.
//
// This is written as a "case study" shape on purpose: each project walks
// through problem -> approach -> stack -> features -> challenges -> outcome,
// so it doubles as talking points for interviews. Replace with your real
// projects — add/remove fields freely, just keep components/ProjectCard.tsx
// in sync if you change the shape.

export type Project = {
  slug: string;
  title: string;
  summary: string;
  status: "in-progress" | "completed" | "archived";
  year: string;
  stack: string[];
  // Optional screenshot, e.g. "/projects/project-one.png". Drop the image
  // in public/projects/ and point this at it — omit to show a placeholder.
  image?: string;
  problem: string;
  approach: string;
  features: string[];
  challenges: string;
  outcome: string;
  links: {
    github?: string;
    live?: string;
  };
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    summary: "One-line description of what this project does and who it's for.",
    status: "completed",
    year: "2026",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    problem:
      "Describe the problem or motivation — what gap this project fills, or what you were trying to learn.",
    approach:
      "Describe your approach — key architecture decisions, why you chose this stack, how you broke the problem down.",
    features: [
      "Key feature one",
      "Key feature two",
      "Key feature three",
    ],
    challenges:
      "Describe a real technical challenge you hit and how you solved it. This is the part interviewers care about most.",
    outcome:
      "What shipped, what you'd do differently, or what you learned.",
    links: {
      github: "https://github.com/your-username/project-one",
      live: "https://project-one.example.com",
    },
  },
  {
    slug: "project-two",
    title: "Project Two",
    summary: "One-line description of what this project does and who it's for.",
    status: "in-progress",
    year: "2026",
    stack: ["React", "Node.js", "Express"],
    problem: "Describe the problem or motivation for this project.",
    approach: "Describe your approach and key decisions.",
    features: ["Key feature one", "Key feature two"],
    challenges: "Describe a real technical challenge and how you solved it.",
    outcome: "Current state and what's left.",
    links: {
      github: "https://github.com/your-username/project-two",
    },
  },
  {
    slug: "project-three",
    title: "Project Three",
    summary: "One-line description of what this project does and who it's for.",
    status: "completed",
    year: "2025",
    stack: ["Next.js", "Prisma", "SQLite"],
    problem: "Describe the problem or motivation for this project.",
    approach: "Describe your approach and key decisions.",
    features: ["Key feature one", "Key feature two", "Key feature three"],
    challenges: "Describe a real technical challenge and how you solved it.",
    outcome: "What shipped and what you learned.",
    links: {
      github: "https://github.com/your-username/project-three",
      live: "https://project-three.example.com",
    },
  },
];
