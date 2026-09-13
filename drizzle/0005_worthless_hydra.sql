ALTER TABLE "ai_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "attendances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chapters" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_students" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "classes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversation_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "curriculums" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "exercises" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lessons" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "schedules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "student_scores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tuitions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ai_messages" CASCADE;--> statement-breakpoint
DROP TABLE "attendances" CASCADE;--> statement-breakpoint
DROP TABLE "chapters" CASCADE;--> statement-breakpoint
DROP TABLE "class_students" CASCADE;--> statement-breakpoint
DROP TABLE "classes" CASCADE;--> statement-breakpoint
DROP TABLE "conversation_participants" CASCADE;--> statement-breakpoint
DROP TABLE "conversations" CASCADE;--> statement-breakpoint
DROP TABLE "curriculums" CASCADE;--> statement-breakpoint
DROP TABLE "exercises" CASCADE;--> statement-breakpoint
DROP TABLE "lessons" CASCADE;--> statement-breakpoint
DROP TABLE "messages" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "schedules" CASCADE;--> statement-breakpoint
DROP TABLE "class_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "student_scores" CASCADE;--> statement-breakpoint
DROP TABLE "tuitions" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "class_id";--> statement-breakpoint
DROP TYPE "public"."ai_message_role";--> statement-breakpoint
DROP TYPE "public"."assignment_status";--> statement-breakpoint
DROP TYPE "public"."category_type";--> statement-breakpoint
DROP TYPE "public"."class_session_status";--> statement-breakpoint
DROP TYPE "public"."class_status";--> statement-breakpoint
DROP TYPE "public"."conversation_type";--> statement-breakpoint
DROP TYPE "public"."curriculum_status";--> statement-breakpoint
DROP TYPE "public"."day_of_week";--> statement-breakpoint
DROP TYPE "public"."exercise_status";--> statement-breakpoint
DROP TYPE "public"."message_status";--> statement-breakpoint
DROP TYPE "public"."notification_action";--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
DROP TYPE "public"."session_format";--> statement-breakpoint
DROP TYPE "public"."session_status";--> statement-breakpoint
DROP TYPE "public"."transaction_status";--> statement-breakpoint
DROP TYPE "public"."transaction_type";--> statement-breakpoint
DROP TYPE "public"."tuition_status";--> statement-breakpoint
DROP TYPE "public"."wallet_type";