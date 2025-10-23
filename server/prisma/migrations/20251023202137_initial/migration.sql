-- CreateTable
CREATE TABLE `USERS` (
    `User_id` BIGINT NOT NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL,

    PRIMARY KEY (`User_id`, `User_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ADMIN` (
    `Admin_id` INTEGER NOT NULL,
    `Admin_name` VARCHAR(30) NOT NULL,
    `Admin_email` VARCHAR(50) NOT NULL,
    `Admin_phone` VARCHAR(15) NOT NULL,
    `Admin_password` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`Admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ELECTION` (
    `Election_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(100) NOT NULL,
    `Start_date` DATETIME(3) NOT NULL,
    `End_date` DATETIME(3) NOT NULL,
    `Status` ENUM('Upcoming', 'Ongoing', 'Completed') NOT NULL,
    `Created_by` INTEGER NOT NULL,

    PRIMARY KEY (`Election_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `STUDENT` (
    `Std_id` BIGINT NOT NULL,
    `Std_name` VARCHAR(30) NOT NULL,
    `Std_phone` VARCHAR(15) NOT NULL,
    `Std_password` VARCHAR(255) NOT NULL,
    `Dob` DATETIME(3) NOT NULL,
    `Std_email` VARCHAR(50) NOT NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL DEFAULT 'Student',
    `Profile` MEDIUMBLOB NULL,
    `Reset_token` VARCHAR(255) NULL,
    `Reset_token_expiry` DATETIME(3) NULL,

    UNIQUE INDEX `STUDENT_Std_id_User_type_key`(`Std_id`, `User_type`),
    PRIMARY KEY (`Std_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CANDIDATE` (
    `Can_id` BIGINT NOT NULL,
    `Can_name` VARCHAR(30) NOT NULL,
    `Position` VARCHAR(30) NOT NULL,
    `Can_email` VARCHAR(50) NOT NULL,
    `Can_phone` VARCHAR(15) NOT NULL,
    `Can_password` VARCHAR(255) NOT NULL,
    `Manifesto` TEXT NOT NULL,
    `Election_id` INTEGER NOT NULL,
    `Branch` VARCHAR(50) NOT NULL,
    `Year` INTEGER NOT NULL,
    `Cgpa` DOUBLE NOT NULL,
    `Data` MEDIUMBLOB NOT NULL,
    `Profile` MEDIUMBLOB NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL DEFAULT 'Candidate',
    `Status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `Rejection_reason` TEXT NULL,
    `Reset_token` VARCHAR(255) NULL,
    `Reset_token_expiry` DATETIME(3) NULL,

    UNIQUE INDEX `CANDIDATE_Can_id_User_type_key`(`Can_id`, `User_type`),
    PRIMARY KEY (`Can_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VOTE` (
    `Vote_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Std_id` BIGINT NOT NULL,
    `Can_id` BIGINT NOT NULL,
    `Election_id` INTEGER NOT NULL,
    `Vote_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `Encrypted_vote` TEXT NOT NULL,

    INDEX `VOTE_Std_id_Election_id_idx`(`Std_id`, `Election_id`),
    UNIQUE INDEX `VOTE_Std_id_Election_id_Can_id_key`(`Std_id`, `Election_id`, `Can_id`),
    PRIMARY KEY (`Vote_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VOTE_RECEIPT` (
    `Receipt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Vote_id` INTEGER NOT NULL,
    `Receipt_token` VARCHAR(255) NOT NULL,
    `Generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VOTE_RECEIPT_Vote_id_key`(`Vote_id`),
    UNIQUE INDEX `VOTE_RECEIPT_Receipt_token_key`(`Receipt_token`),
    INDEX `VOTE_RECEIPT_Receipt_token_idx`(`Receipt_token`),
    PRIMARY KEY (`Receipt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RESULT` (
    `R_id` INTEGER NOT NULL AUTO_INCREMENT,
    `Can_id` BIGINT NOT NULL,
    `Election_id` INTEGER NOT NULL,
    `Vote_count` INTEGER NOT NULL,
    `Admin_id` INTEGER NOT NULL,

    UNIQUE INDEX `RESULT_Election_id_Can_id_key`(`Election_id`, `Can_id`),
    PRIMARY KEY (`R_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FEEDBACK` (
    `FB_id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_id` BIGINT NOT NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL,
    `FB_time` TIMESTAMP(0) NOT NULL,
    `Message` TEXT NOT NULL,
    `Status` VARCHAR(50) NOT NULL,
    `Admin_id` INTEGER NULL,

    PRIMARY KEY (`FB_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SYSTEM_LOGS` (
    `Log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_id` BIGINT NOT NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL,
    `Admin_id` INTEGER NULL,
    `Log_time` TIMESTAMP(0) NOT NULL,
    `Log_type` ENUM('Authentication', 'Audit') NOT NULL,
    `Action` TEXT NOT NULL,

    PRIMARY KEY (`Log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NOTIFICATION` (
    `N_id` INTEGER NOT NULL AUTO_INCREMENT,
    `User_id` BIGINT NOT NULL,
    `User_type` ENUM('Student', 'Candidate') NOT NULL,
    `Notif_time` TIMESTAMP(0) NOT NULL,
    `Notif_message` TEXT NOT NULL,
    `Admin_id` INTEGER NULL,

    PRIMARY KEY (`N_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ELECTION` ADD CONSTRAINT `ELECTION_Created_by_fkey` FOREIGN KEY (`Created_by`) REFERENCES `ADMIN`(`Admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `STUDENT` ADD CONSTRAINT `STUDENT_Std_id_User_type_fkey` FOREIGN KEY (`Std_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `ELECTION`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CANDIDATE` ADD CONSTRAINT `CANDIDATE_Can_id_User_type_fkey` FOREIGN KEY (`Can_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_Std_id_fkey` FOREIGN KEY (`Std_id`) REFERENCES `STUDENT`(`Std_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_Can_id_fkey` FOREIGN KEY (`Can_id`) REFERENCES `CANDIDATE`(`Can_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE` ADD CONSTRAINT `VOTE_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `ELECTION`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VOTE_RECEIPT` ADD CONSTRAINT `VOTE_RECEIPT_Vote_id_fkey` FOREIGN KEY (`Vote_id`) REFERENCES `VOTE`(`Vote_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RESULT` ADD CONSTRAINT `RESULT_Can_id_fkey` FOREIGN KEY (`Can_id`) REFERENCES `CANDIDATE`(`Can_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RESULT` ADD CONSTRAINT `RESULT_Election_id_fkey` FOREIGN KEY (`Election_id`) REFERENCES `ELECTION`(`Election_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RESULT` ADD CONSTRAINT `RESULT_Admin_id_fkey` FOREIGN KEY (`Admin_id`) REFERENCES `ADMIN`(`Admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `FEEDBACK_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FEEDBACK` ADD CONSTRAINT `FEEDBACK_Admin_id_fkey` FOREIGN KEY (`Admin_id`) REFERENCES `ADMIN`(`Admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SYSTEM_LOGS` ADD CONSTRAINT `SYSTEM_LOGS_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SYSTEM_LOGS` ADD CONSTRAINT `SYSTEM_LOGS_Admin_id_fkey` FOREIGN KEY (`Admin_id`) REFERENCES `ADMIN`(`Admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NOTIFICATION` ADD CONSTRAINT `NOTIFICATION_User_id_User_type_fkey` FOREIGN KEY (`User_id`, `User_type`) REFERENCES `USERS`(`User_id`, `User_type`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NOTIFICATION` ADD CONSTRAINT `NOTIFICATION_Admin_id_fkey` FOREIGN KEY (`Admin_id`) REFERENCES `ADMIN`(`Admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;
