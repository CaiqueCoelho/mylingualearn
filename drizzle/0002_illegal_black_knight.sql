CREATE TABLE `news_fetch_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(100) NOT NULL,
	`fetchDate` timestamp NOT NULL,
	`articleCount` int NOT NULL DEFAULT 0,
	`source` varchar(50) NOT NULL DEFAULT 'newsdata',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_fetch_cache_id` PRIMARY KEY(`id`)
);
