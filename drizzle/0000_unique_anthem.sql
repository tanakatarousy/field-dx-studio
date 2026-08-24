CREATE TABLE `consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`company_name` text DEFAULT '' NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`interest` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `consultations_status_idx` ON `consultations` (`status`);--> statement-breakpoint
CREATE INDEX `consultations_created_at_idx` ON `consultations` (`created_at`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`color` text NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`first_referrer` text DEFAULT 'direct' NOT NULL,
	`first_utm_source` text DEFAULT '' NOT NULL,
	`is_excluded` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visitors_last_seen_idx` ON `visitors` (`last_seen_at`);--> statement-breakpoint
CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` text NOT NULL,
	`path` text NOT NULL,
	`referrer` text DEFAULT 'direct' NOT NULL,
	`utm_source` text DEFAULT '' NOT NULL,
	`utm_medium` text DEFAULT '' NOT NULL,
	`utm_campaign` text DEFAULT '' NOT NULL,
	`device` text DEFAULT 'desktop' NOT NULL,
	`visit_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visits_visitor_path_day_unique` ON `visits` (`visitor_id`,`path`,`visit_date`);--> statement-breakpoint
CREATE INDEX `visits_created_at_idx` ON `visits` (`created_at`);--> statement-breakpoint
CREATE INDEX `visits_visitor_id_idx` ON `visits` (`visitor_id`);