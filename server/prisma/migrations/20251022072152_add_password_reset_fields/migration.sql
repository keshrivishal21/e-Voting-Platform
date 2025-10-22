/*
  Warnings:

  - You are about to alter the column `Vote_time` on the `vote` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `candidate` ADD COLUMN `Reset_token` VARCHAR(255) NULL,
    ADD COLUMN `Reset_token_expiry` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `Reset_token` VARCHAR(255) NULL,
    ADD COLUMN `Reset_token_expiry` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `vote` MODIFY `Vote_time` TIMESTAMP NOT NULL;
