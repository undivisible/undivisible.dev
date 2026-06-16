import Home from "@/page-components/home";
import { getNowMarkdown } from "@/lib/now-markdown";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export default function Page() {
  const readme = getProfileReadmeProjects();
  const nowMarkdown = getNowMarkdown();
  return <Home readme={readme} nowMarkdown={nowMarkdown} />;
}
