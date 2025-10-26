/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `candidate` DROP FOREIGN KEY `CANDIDATE_Can_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `feedback` DROP FOREIGN KEY `FEEDBACK_User_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `NOTIFICATION_User_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `STUDENT_Std_id_User_type_fkey`;

-- DropForeignKey
ALTER TABLE `system_logs` DROP FOREIGN KEY `SYSTEM_LOGS_User_id_User_type_fkey`;

-- DropIndex
DROP INDEX `FEEDBACK_User_id_User_type_fkey` ON `feedback`;

-- DropIndex
DROP INDEX `NOTIFICATION_User_id_User_type_fkey` ON `notification`;

-- DropIndex
DROP INDEX `SYSTEM_LOGS_User_id_User_type_fkey` ON `system_logs`;

-- AlterTable
ALTER TABLE `candidate` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL DEFAULT 'Candidate';

-- AlterTable
ALTER TABLE `feedback` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL;

-- AlterTable
ALTER TABLE `student` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL DEFAULT 'Student';

-- AlterTable
ALTER TABLE `system_logs` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NOT NULL,
    ADD PRIMARY KEY (`User_id`, `User_type`);

-- AddForeignKey
ALTER TABLE `STUDENT` ADD CONSTRAINT `STUDENT_Std_id_User_type_fkey` FOREIGN KEY (`Std_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_Can_id_User_type_fkey` FOREIGN KEY (`Can_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `FEEDBACK_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SYSTEM_LOGS` ADD CONSTRAINT `SYSTEM_LOGS_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NOTIFICATION` ADD CONSTRAINT `NOTIFICATION_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;
