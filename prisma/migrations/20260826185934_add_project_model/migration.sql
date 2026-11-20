-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "year" TEXT NOT NULL,
    "stack" TEXT[],
    "image" TEXT,
    "screenshots" TEXT[],
    "problem" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "features" TEXT[],
    "challenges" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
