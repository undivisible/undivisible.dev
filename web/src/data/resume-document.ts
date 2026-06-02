import { projectKey, type ReadmeBundle } from "@/lib/profile-readme";
import {
  resumeItemBlurb,
  type ResumeContactRow,
  type ResumeDocument,
  type ResumeExperience,
  type ResumeProject,
} from "@/lib/parse-resume-markdown";
import { resumeFromMarkdown } from "@/data/resume-from-markdown.generated";

export type { ResumeContactRow, ResumeExperience, ResumeProject };

const resumeDoc = resumeFromMarkdown as unknown as ResumeDocument;

export const resumeContact: ResumeContactRow[] = resumeDoc.contact;

export const resumeExperience: ResumeExperience[] = resumeDoc.experience.map(
  (job) => ({
    ...job,
    points: job.bullets,
  }),
);

export const resumeSkillGroups: ResumeContactRow[] = resumeDoc.skills;

export const resumeEducation: string[] = [...resumeDoc.education];

export const resumeHumanLanguages: string[] = [...resumeDoc.humanLanguages];

export const resumeCommunity: string[] = [...resumeDoc.community];

export const resumeInterests: string[] = [...resumeDoc.interests];

export { resumeFromMarkdown, resumeDoc };

function normHref(h: string) {
  return h.replace(/\/$/, "").toLowerCase();
}

function stripMdLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function isInReadme(
  p: { name: string; href: string },
  readme: ReadmeBundle,
): boolean {
  const hrefs = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      normHref(p.href),
    ),
  );
  const names = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      projectKey(p.name),
    ),
  );
  if (p.href.trim() && p.href !== "#" && hrefs.has(normHref(p.href))) {
    return true;
  }
  return names.has(projectKey(p.name));
}

export function resumeSectionsNotInReadme(
  readme: ReadmeBundle,
): Array<{ section: string; projects: ResumeProject[] }> {
  const seen = new Set<string>();
  const out: Array<{ section: string; projects: ResumeProject[] }> = [];

  for (const section of resumeDoc.projectSections) {
    const filtered: ResumeProject[] = [];
    for (const item of section.items) {
      const key = `${item.name}:${item.href}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      if (isInReadme(item, readme)) continue;
      filtered.push({
        name: item.name,
        href: item.href,
        desc: resumeItemBlurb(item),
        stack: item.stack,
      });
    }
    if (filtered.length > 0) {
      out.push({ section: stripMdLinks(section.title), projects: filtered });
    }
  }

  for (const job of resumeDoc.experience) {
    for (const sub of job.subsections) {
      const filtered: ResumeProject[] = [];
      for (const item of sub.items) {
        const key = `${item.name}:${item.href}`.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (isInReadme(item, readme)) continue;
        filtered.push({
          name: item.name,
          href: item.href,
          desc: resumeItemBlurb(item),
          stack: item.stack,
        });
      }
      if (filtered.length > 0) {
        out.push({ section: stripMdLinks(sub.title), projects: filtered });
      }
    }
  }

  return out;
}
