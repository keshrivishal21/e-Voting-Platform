/*
  Warnings:

  - You are about to alter the column `Vote_time` on the `vote` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/

-- Drop foreign key constraints temporarily
ALTER TABLE `candidate` DROP FOREIGN KEY `CANDIDATE_Election_id_fkey`;
ALTER TABLE `vote` DROP FOREIGN KEY `VOTE_Election_id_fkey`;
ALTER TABLE `result` DROP FOREIGN KEY `RESULT_Election_id_fkey`;

-- AlterTable
ALTER TABLE `election` MODIFY `Election_id` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `vote` MODIFY `Vote_time` TIMESTAMP NOT NULL;

-- Recreate foreign key constraints
ALTER TABLE `candidate` ADD CONSTRAINT `CANDIDATE_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `election`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `vote` ADD CONSTRAINT `VOTE_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `election`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `result` ADD CONSTRAINT `RESULT_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `election`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
