-- CreateTable
CREATE TABLE "UserProblemId" (
    "userId" TEXT NOT NULL,
    "problemIds" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProblemId_pkey" PRIMARY KEY ("userId")
);
