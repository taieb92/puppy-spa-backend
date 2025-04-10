-- CreateTable
CREATE TABLE `waiting_lists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `waiting_lists_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaitingListEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerName` VARCHAR(191) NULL,
    `puppyName` VARCHAR(191) NULL,
    `serviceRequired` VARCHAR(191) NOT NULL,
    `arrivalTime` DATETIME(3) NOT NULL,
    `position` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'waiting',
    `waitingListId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WaitingListEntry_waitingListId_idx`(`waitingListId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WaitingListEntry` ADD CONSTRAINT `WaitingListEntry_waitingListId_fkey` FOREIGN KEY (`waitingListId`) REFERENCES `waiting_lists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
