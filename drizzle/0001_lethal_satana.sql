DROP INDEX `visits_visitor_path_day_unique`;--> statement-breakpoint
ALTER TABLE `visits` ADD `browser` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `visits` ADD `country` text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
CREATE INDEX `visits_visit_date_idx` ON `visits` (`visit_date`);