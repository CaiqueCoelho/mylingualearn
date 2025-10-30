CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('read','quiz','vocab','game','chat') NOT NULL,
	`xpEarned` int NOT NULL DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`body` text NOT NULL,
	`topics` text,
	`publishedAt` timestamp NOT NULL,
	`readingLevel` enum('A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`source` varchar(255) NOT NULL,
	`sourceUrl` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` varchar(255) NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`answers` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` varchar(255) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`timeSpentSeconds` int NOT NULL DEFAULT 0,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lemma` varchar(255) NOT NULL,
	`pos` varchar(50),
	`ipa` varchar(255),
	`enDef` text,
	`ptDef` text,
	`example` text,
	`sourceArticleId` varchar(255),
	`easiness` float NOT NULL DEFAULT 2.5,
	`interval` int NOT NULL DEFAULT 1,
	`repetitions` int NOT NULL DEFAULT 0,
	`nextReview` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_words_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'A2',
	`learningGoals` text,
	`topics` text,
	`dailyGoalMinutes` int NOT NULL DEFAULT 15,
	`streakDays` int NOT NULL DEFAULT 0,
	`lastActiveDate` timestamp,
	`totalXp` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
