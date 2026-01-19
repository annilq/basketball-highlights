/**
 * Database schema for shot detection results.
 *
 * Tables defined:
 * - `shotDetection`: Stores main shot detection results
 * - `shotEvent`: Stores individual shot events (one-to-many with shotDetection)
 */

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { team } from "./team";
import { user } from "./user";

/**
 * Main shot detection results table.
 * Stores the overall results of a shot detection process.
 */
export const shotDetection = pgTable(
  "shotDetection",
  {
    id: text()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: text().references(() => team.id, { onDelete: "cascade" }),
    videoUrl: text(),
    videoName: text(),
    attempts: integer().notNull(),
    makes: integer().notNull(),
    shootingPercentage: numeric({ precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("shot_detection_user_id_idx").on(table.userId),
    index("shot_detection_team_id_idx").on(table.teamId),
  ],
);

export type ShotDetection = typeof shotDetection.$inferSelect;
export type NewShotDetection = typeof shotDetection.$inferInsert;

/**
 * Individual shot events table.
 * Stores details of each detected shot event.
 */
export const shotEvent = pgTable("shotEvent", {
  id: text()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shotDetectionId: text()
    .notNull()
    .references(() => shotDetection.id, { onDelete: "cascade" }),
  frame: integer().notNull(),
  isMake: integer().notNull(), // 0 = miss, 1 = make
  attempts: integer().notNull(),
  makes: integer().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export type ShotEvent = typeof shotEvent.$inferSelect;
export type NewShotEvent = typeof shotEvent.$inferInsert;

// —————————————————————————————————————————————————————————————————————————————
// Relations for better query experience
// —————————————————————————————————————————————————————————————————————————————

export const shotDetectionRelations = relations(
  shotDetection,
  ({ one, many }) => ({
    user: one(user, {
      fields: [shotDetection.userId],
      references: [user.id],
    }),
    team: one(team, {
      fields: [shotDetection.teamId],
      references: [team.id],
    }),
    shotEvents: many(shotEvent),
  }),
);

export const shotEventRelations = relations(shotEvent, ({ one }) => ({
  shotDetection: one(shotDetection, {
    fields: [shotEvent.shotDetectionId],
    references: [shotDetection.id],
  }),
}));
