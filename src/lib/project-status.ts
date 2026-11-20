export const PROJECT_STATUSES = ["in-progress", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && (PROJECT_STATUSES as readonly string[]).includes(value);
}

export const statusLabel: Record<ProjectStatus, string> = {
  "in-progress": "in progress",
  completed: "completed",
  archived: "archived",
};
