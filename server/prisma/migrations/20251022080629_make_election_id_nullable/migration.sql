/*
  Warnings:

  - You are about to alter the column `Vote_time` on the `vote` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropForeignKey
ALTER TABLE `candidate` DROP FOREIGN KEY `CANDIDATE_Election_id_fkey`;

-- DropIndex
DROP INDEX `CANDIDATE_Election_id_fkey` ON `candidate`;

-- AlterTable
ALTER TABLE `candidate` MODIFY `Election_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `vote` MODIFY `Vote_time` TIMESTAMP NOT NULL;

-- AddForeignKey
ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `ELECTION`(`Election_id`) ON DELETE SET NULL ON UPDATE CASCADE;
