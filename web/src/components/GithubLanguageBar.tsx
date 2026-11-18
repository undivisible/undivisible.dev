import type { PreparedGithubLanguages } from "../lib/github-repo-languages";

export function GithubLanguageBar({
  languages,
}: {
  languages: PreparedGithubLanguages;
}) {
  const content = (
    <>
      {languages.segments.length > 0 && (
        <span className="github-language-bar" aria-hidden="true">
          {languages.segments.map((segment) => (
            <span
              key={segment.name}
              title={segment.label}
              style={{
                width: `${segment.percentage}%`,
                backgroundColor:
                  segment.color ?? "var(--github-language-fallback, #8c959f)",
              }}
            />
          ))}
        </span>
      )}
      <span className="github-language-label">
        {languages.label.split(" · ").map((share, index) => (
          <span key={share}>
            {index > 0 && " · "}
            <span style={{ whiteSpace: "nowrap" }}>{share}</span>
          </span>
        ))}
      </span>
    </>
  );
  return languages.repository ? (
    <a
      className="github-languages"
      href={`https://github.com/${languages.repository}#languages`}
      aria-label={languages.accessibleLabel}
      title={languages.accessibleLabel}
    >
      {content}
    </a>
  ) : (
    <span className="github-languages">{content}</span>
  );
}
