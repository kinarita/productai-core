import { TasksView } from "@/components/tasks/TasksView";

interface TasksPageProps {
  searchParams: Promise<{ mission?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { mission } = await searchParams;
  return <TasksView missionFilter={mission} />;
}
