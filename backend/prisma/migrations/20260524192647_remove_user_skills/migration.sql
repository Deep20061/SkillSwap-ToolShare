/*
  Warnings:

  - You are about to drop the `user_skill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_skill" DROP CONSTRAINT "user_skill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "user_skill" DROP CONSTRAINT "user_skill_userId_fkey";

-- DropTable
DROP TABLE "user_skill";

-- DropEnum
DROP TYPE "SkillLevel";
