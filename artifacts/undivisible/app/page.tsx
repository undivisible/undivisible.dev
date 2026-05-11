import Home from "@/page-components/home";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export const revalidate = 300;

export default async function Page() {
  const readme = await getProfileReadmeProjects();
  return <Home readme={readme} />;
}
