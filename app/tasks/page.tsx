import { TasksView } from "@/components/tasks/TasksView";

interface TasksPageProps {
  searchParams: Promise<{ mission?: string; status?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { mission, status } = await searchParams;
  return <TasksView missionFilter={mission} statusFilter={status} />;
}
