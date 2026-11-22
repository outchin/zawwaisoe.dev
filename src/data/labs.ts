// Labs live in their own repo and app (github.com/outchin/nestjs-recipe) and are served
// at /labs through the rewrite in next.config.ts. Measured numbers stay on the lab pages
// (they come from the recorded runs); this list only says what each lab is about.
export type Lab = {
  no: string;
  title: string;
  question: string;
  path: string;
  stack: string[];
};

export const labs: Lab[] = [
  {
    no: "01",
    title: "Idempotency keys",
    question: "Send a purchase twice. Do you pay twice?",
    path: "/labs/inventory/idempotency",
    stack: ["NestJS", "MySQL", "UNIQUE constraint"],
  },
  {
    no: "02",
    title: "Indexes & EXPLAIN",
    question: "Why does the same query go from reading the whole table to reading a handful of rows?",
    path: "/labs/indexes",
    stack: ["MySQL 8", "B-tree", "EXPLAIN"],
  },
];
