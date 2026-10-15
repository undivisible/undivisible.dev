import Home from "@/page-components/home";
import { getProfileReadmeProjects } from "@/lib/profile-readme";

export default function Page() {
  const readme = getProfileReadmeProjects();
  return (
    <>
      <noscript>
        <p style={{ padding: 24 }}>
          <a href="/simple/">Open the simple version</a>
        </p>
      </noscript>
      <Home readme={readme} />
    </>
  );
}
