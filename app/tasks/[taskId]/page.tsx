import { notFound } from "next/navigation";
import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { tasks as seedTasks } from "@/data/mockData";

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;

  // Validate route exists in seed data to avoid rendering invalid routes.
  if (!seedTasks.some((t) => t.id === taskId)) {
    notFound();
  }

  return <TaskDetailView taskId={taskId} />;
}

