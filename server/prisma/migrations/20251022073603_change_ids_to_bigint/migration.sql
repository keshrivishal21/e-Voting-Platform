/*
  Warnings:

  - The primary key for the `candidate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `Vote_time` on the `vote` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropForeignKey
ALTER TABLE `candidate` DROP FOREIGN KEY `CANDIDATE_Can_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `feedback` DROP FOREIGN KEY `FEEDBACK_User_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `NOTIFICATION_User_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `result` DROP FOREIGN KEY `RESULT_Can_id_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `STUDENT_Std_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `system_logs` DROP FOREIGN KEY `SYSTEM_LOGS_User_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `VOTE_Can_id_fkey`;

-- DropForeignKey
ALTER TABLE `vote` DROP FOREIGN KEY `VOTE_Std_id_fkey`;

-- DropIndex
DROP INDEX `FEEDBACK_User_id_User_type_fkey` ON `feedback`;

-- DropIndex
DROP INDEX `NOTIFICATION_User_id_User_type_fkey` ON `notification`;

-- DropIndex
DROP INDEX `RESULT_Can_id_fkey` ON `result`;

-- DropIndex
DROP INDEX `SYSTEM_LOGS_User_id_User_type_fkey` ON `system_logs`;

-- DropIndex
DROP INDEX `VOTE_Can_id_fkey` ON `vote`;

-- AlterTable
ALTER TABLE `candidate` DROP PRIMARY KEY,
    MODIFY `Can_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`Can_id`);

-- AlterTable
ALTER TABLE `feedback` MODIFY `User_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `User_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `result` MODIFY `Can_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `student` DROP PRIMARY KEY,
    MODIFY `Std_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`Std_id`);

-- AlterTable
ALTER TABLE `system_logs` MODIFY `User_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `User_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`User_id`, `User_type`);

-- AlterTable
ALTER TABLE `vote` MODIFY `Std_id` BIGINT NOT NULL,
    MODIFY `Can_id` BIGINT NOT NULL,
    MODIFY `Vote_time` TIMESTAMP NOT NULL;

-- AddForeignKey
ALTER TABLE `STUDENT` ADD CONSTRAINT `STUDENT_Std_id_User_type_fkey` FOREIGN KEY (`Std_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_Can_id_User_type_fkey` FOREIGN KEY (`Can_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_Std_id_fkey` FOREIGN KEY (`Std_id`) REFERENCES `STUDENT`(`Std_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_Can_id_fkey` FOREIGN KEY (`Can_id`) REFERENCES `CANDIDATE`(`Can_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RESULT` ADD CONSTRAINT `RESULT_Can_id_fkey` FOREIGN KEY (`Can_id`) REFERENCES `CANDIDATE`(`Can_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `FEEDBACK_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SYSTEM_LOGS` ADD CONSTRAINT `SYSTEM_LOGS_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NOTIFICATION` ADD CONSTRAINT `NOTIFICATION_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;
