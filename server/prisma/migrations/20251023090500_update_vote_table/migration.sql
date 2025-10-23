-- DropIndex
DROP INDEX IF EXISTS `VOTE_Std_id_Election_id_key` ON `VOTE`;

-- AlterTable  
ALTER TABLE `VOTE` 
  MODIFY `Vote_id` INTEGER NOT NULL AUTO_INCREMENT,
  MODIFY `Vote_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY `Encrypted_vote` TEXT NOT NULL;

-- CreateIndex
CREATE INDEX `VOTE_Std_id_Election_id_idx` ON `VOTE`(`Std_id`, `Election_id`);

-- CreateIndex
CREATE UNIQUE INDEX `VOTE_Std_id_Election_id_Can_id_key` ON `VOTE`(`Std_id`, `Election_id`, `Can_id`);
