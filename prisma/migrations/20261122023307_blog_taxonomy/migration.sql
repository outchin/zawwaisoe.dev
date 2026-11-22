-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'engineering',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "topic" TEXT;

-- CreateIndex
CREATE INDEX "Post_category_topic_idx" ON "Post"("category", "topic");

-- Backfill: classify the posts that existed before the taxonomy.
-- Matched by slug, so it is a no-op for any post that isn't there.
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Architecture'] WHERE "slug" IN
  ('kubernetes-architecture', 'kubernetes-architecture-summary', 'etcd', 'kuber-api-server', 'kubelet');
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Scheduling'] WHERE "slug" IN
  ('kubernetes-scheduling-concepts', 'kubernetes-scheduler', 'kubernetes-scheduler-plugins-profiles', 'taints-tolerations');
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Workloads'] WHERE "slug" IN
  ('pods-replicaset-deployment', 'kubernetes-jobs');
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Resource Management'] WHERE "slug" IN
  ('resources-requests-limits', 'limitrange-resource-quoata');
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Security', 'RBAC'] WHERE "slug" = 'kubernetes-authorization-complete-guide';
UPDATE "Post" SET "topic" = 'kubernetes', "tags" = ARRAY['Security', 'TLS'] WHERE "slug" = 'tls-in-kubernetes-certificate-creation';

UPDATE "Post" SET "topic" = 'containers', "tags" = ARRAY['Runtimes'] WHERE "slug" IN
  ('docker-daemon-vs-nerdctl', 'docker-vs-containerd', 'docker-deprecation');
UPDATE "Post" SET "topic" = 'containers', "tags" = ARRAY['Fundamentals'] WHERE "slug" = 'docker-sharing-kernel-concept';
UPDATE "Post" SET "topic" = 'containers', "tags" = ARRAY['Images'] WHERE "slug" IN
  ('oci-standard-open-container-initiative', 'lazy-pulling-p2p-image-distribution');

UPDATE "Post" SET "topic" = 'aws', "tags" = ARRAY['VPC', 'Networking'] WHERE "slug" = 'aws-networking-internet-gateway-route-table-public-vs-private-subnet';
UPDATE "Post" SET "topic" = 'aws', "tags" = ARRAY['S3', 'Architecture'] WHERE "slug" = 'aws-s3-pre-signed-url-upload-architecture';

UPDATE "Post" SET "topic" = 'networking', "tags" = ARRAY['Fundamentals'] WHERE "slug" = 'network-interfaces-port-binding';
UPDATE "Post" SET "topic" = 'security', "tags" = ARRAY['TLS'] WHERE "slug" = 'tls-certificates-step-by-step-guide';
UPDATE "Post" SET "topic" = 'linux', "tags" = ARRAY['SSH'] WHERE "slug" = 'ssh-copy-id';
UPDATE "Post" SET "topic" = 'devops', "tags" = ARRAY['GitOps'] WHERE "slug" = 'gitops-argocd-flux';
