-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "result" TEXT,
    "issuer" TEXT,
    "date" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "credentialUrl" TEXT,
    "credentialId" TEXT,
    "validUntil" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Award_slug_key" ON "Award"("slug");

-- Starter entries. Photos are added later from /admin/awards.
-- Keyed by slug, so re-running never overwrites edits made in the admin.
INSERT INTO "Award" ("id", "slug", "kind", "title", "result", "issuer", "date", "description", "order", "updatedAt") VALUES
  (md5(random()::text), 'cka', 'certification', 'Certified Kubernetes Administrator (CKA)', 'Certified',
   'The Linux Foundation · CNCF', NULL,
   $$A performance-based exam with no multiple choice: real tasks on live Kubernetes clusters, against the clock. It covers building and upgrading clusters with kubeadm, workloads and scheduling, Services and networking, storage, RBAC, and troubleshooting broken nodes and pods.$$, 1, now()),
  (md5(random()::text), 'terraform-associate', 'certification', 'HashiCorp Certified: Terraform Associate', 'Certified',
   'HashiCorp', NULL,
   $$Infrastructure as code with Terraform: the init / plan / apply workflow, providers and modules, managing state (including remote state and locking), and reading and writing HCL.$$, 2, now()),
  (md5(random()::text), 'aws-cloud-practitioner', 'certification', 'AWS Certified Cloud Practitioner', 'Certified',
   'Amazon Web Services', NULL,
   $$Foundational AWS knowledge: cloud concepts, the shared responsibility model and security, core services across compute, storage, networking and databases, and pricing and billing.$$, 3, now()),

  (md5(random()::text), 'ai-ml-project-competition', 'achievement', 'AI & Machine Learning Project Competition', '2nd Prize',
   'University of Technology (Yatanarpon Cyber City)', '5th year',
   $$Second prize in the university's AI and machine learning project competition in my fifth year.$$, 1, now()),
  (md5(random()::text), 'mpt-entrepreneurship-program', 'achievement', 'MPT Entrepreneurship Program', 'Finalist · Top 8',
   'MPT', NULL,
   $$Teams from across Myanmar applied. Sixteen were selected, eight from Upper Myanmar and eight from Lower Myanmar, and my team went on to the final eight.$$, 2, now()),
  (md5(random()::text), 'yetagun-youth-program', 'achievement', 'Yetagun Youth Program', 'Finalist · Top 8',
   NULL, NULL,
   $$A nationwide youth program. Sixteen teams were selected, eight from Upper Myanmar and eight from Lower Myanmar, and my team went on to the final eight.$$, 3, now()),
  (md5(random()::text), 'j2ee-project-competition', 'achievement', 'J2EE Project Competition', '3rd Prize',
   'University of Technology (Yatanarpon Cyber City)', '4th year',
   $$Third prize in the university's J2EE (Java Enterprise Edition) project competition in my fourth year.$$, 4, now()),
  (md5(random()::text), 'csharp-project-competition', 'achievement', 'C# Project Competition', '3rd Prize',
   'University of Technology (Yatanarpon Cyber City)', '3rd year',
   $$Third prize in the university's C# project competition in my third year.$$, 5, now()),
  (md5(random()::text), 'tailwind-css-short-course-competition', 'achievement', 'Tailwind CSS Short Course Competition', '3rd Prize',
   'University of Technology (Yatanarpon Cyber City)', NULL,
   $$Third prize in the competition held as part of the university's Tailwind CSS short course.$$, 6, now()),
  (md5(random()::text), 'ooredoo-hackathon', 'achievement', 'Ooredoo Hackathon', 'Participant',
   'Ooredoo Myanmar', NULL,
   $$Took part in the Ooredoo hackathon.$$, 7, now())
ON CONFLICT ("slug") DO NOTHING;
