import Home from "@/page-components/home";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export default function Page() {
  return <Home readme={getProfileReadmeProjects()} />;
}
