-- DropForeignKey
ALTER TABLE `system_logs` DROP FOREIGN KEY `SYSTEM_LOGS_User_id_User_type_fkey`;

-- DropIndex
DROP INDEX `SYSTEM_LOGS_User_id_User_type_fkey` ON `system_logs`;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `Email_verified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `system_logs` MODIFY `User_type` ENUM('Student', 'Candidate', 'Admin') NULL;

-- AddForeignKey
ALTER TABLE `SYSTEM_LOGS` ADD CONSTRAINT `SYSTEM_LOGS_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE SET NULL ON UPDATE CASCADE;
