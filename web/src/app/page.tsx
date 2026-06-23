import Home from "@/page-components/home";
import { nowMarkdownFromRepo } from "@/data/now-markdown.generated";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export default function Page() {
  const readme = getProfileReadmeProjects();
  return <Home readme={readme} nowMarkdown={nowMarkdownFromRepo} />;
}
