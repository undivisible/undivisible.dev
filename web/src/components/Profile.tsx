import { profile, projects } from "@/data/profile";

export function Profile({ simple = false }: { simple?: boolean }) {
  return (
    <div className={`profile-page${simple ? " profile-simple" : ""}`}>
      <a className="profile-skip" href="#content">
        Skip to content
      </a>
      <header className="profile-header">
        <a className="profile-wordmark" href="/">
          undivisible<span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href={simple ? "/" : "/simple/"}>
            {simple ? "Main version" : "Simple version"}
          </a>
          <a href="/lab/">Lab</a>
          <a href="/resume.md">Résumé</a>
        </nav>
      </header>
      <main id="content" tabIndex={-1}>
        <section className="profile-intro" aria-labelledby="profile-name">
          <p className="profile-eyebrow">Software & systems</p>
          <h1 id="profile-name">
            {profile.name} <span lang="zh">{profile.hanzi}</span>
          </h1>
          <p className="profile-description">{profile.description}</p>
          <div className="profile-links">
            <a href={`mailto:${profile.email}`}>
              Email <span aria-hidden="true">↗</span>
            </a>
            <a href={profile.github}>
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href="https://tsc.hk">
              tsc.hk <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <section className="profile-section" aria-labelledby="work-heading">
          <div className="profile-section-heading">
            <h2 id="work-heading">Selected projects</h2>
            <p>Open-source work</p>
          </div>
          <ul className="profile-projects">
            {projects.map((project) => (
              <li key={project.name}>
                <p className="profile-kind">{project.kind}</p>
                <h3>
                  <a href={project.href}>
                    {project.name} <span aria-hidden="true">↗</span>
                  </a>
                </h3>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
          <a
            className="profile-more"
            href={`${profile.github}?tab=repositories`}
          >
            All repositories <span aria-hidden="true">↗</span>
          </a>
        </section>
        <section className="profile-section" aria-labelledby="resume-heading">
          <div className="profile-section-heading">
            <h2 id="resume-heading">Résumé</h2>
            <a href="/resume.md">
              Experience and skills <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <aside className="profile-lab" aria-labelledby="lab-heading">
          <div>
            <h2 id="lab-heading">Linux desktop</h2>
            <p>The main version runs Alpenglow Linux in your browser.</p>
          </div>
          <a href="/lab/">
            Open Linux <span aria-hidden="true">→</span>
          </a>
        </aside>
      </main>
      <footer className="profile-footer">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href="/agent">Text & agent files</a>
      </footer>
    </div>
  );
}
