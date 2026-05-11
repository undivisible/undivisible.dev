import Home from "@/page-components/home";
import { getNowMarkdown } from "@/lib/now-markdown";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export const revalidate = 300;

export default async function Page() {
  const readme = await getProfileReadmeProjects();
  const nowMarkdown = getNowMarkdown();
  return <Home readme={readme} nowMarkdown={nowMarkdown} />;
}
