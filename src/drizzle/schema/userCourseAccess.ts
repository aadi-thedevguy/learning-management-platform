import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { CourseTable } from "./course";
import { UserTable } from "./user";

export const UserCourseAccessTable = pgTable(
  "user_course_access",
  {
    userId: text()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    courseId: uuid()
      .notNull()
      .references(() => CourseTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })],
);

export const UserCourseAccessRelationships = relations(
  UserCourseAccessTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserCourseAccessTable.userId],
      references: [UserTable.id],
    }),
    course: one(CourseTable, {
      fields: [UserCourseAccessTable.courseId],
      references: [CourseTable.id],
    }),
  }),
);
