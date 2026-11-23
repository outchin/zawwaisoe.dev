-- CKA passed Nov 2024 (score 95), expired Nov 2026: say so honestly and list it after the active certifications.
UPDATE "Award" SET
  "result" = 'Passed 95% · Expired',
  "date" = 'Nov 2024',
  "validUntil" = 'Nov 2026',
  "description" = $$Passed in November 2024 with a score of 95% (pass mark 66%). The certification expired in November 2026.

A performance-based exam with no multiple choice: real tasks on live Kubernetes clusters, against the clock. It covers building and upgrading clusters with kubeadm, workloads and scheduling, Services and networking, storage, RBAC, and troubleshooting broken nodes and pods.$$,
  "order" = 4,
  "updatedAt" = now()
WHERE "slug" = 'cka' AND "date" IS NULL;
