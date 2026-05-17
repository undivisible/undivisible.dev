import type { ReadmeBundle } from "@/lib/profile-readme";
import {
  flattenPrintProjects,
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
  }));

export const resumePrintProjects: ResumeProject[] = flattenPrintProjects(
  resumeDoc,
).map((item) => ({
  name: item.name,
  href: item.href,
  desc: [item.meta, item.desc].filter(Boolean).join(" — "),
  stack: item.stack,
}));

export const resumeSkillGroups: ResumeContactRow[] = resumeDoc.skills;

export const resumeEducation: string[] = [...resumeDoc.education];

export const resumeHumanLanguages: string[] = [...resumeDoc.humanLanguages];

export const resumeCommunity: string[] = [...resumeDoc.community];

export const resumeInterests: string[] = [...resumeDoc.interests];

export { resumeFromMarkdown, resumeDoc };

function normHref(h: string) {
  return h.replace(/\/$/, "").toLowerCase();
}

export function resumeProjectsNotInReadme(
  readme: ReadmeBundle,
): ResumeProject[] {
  const hrefs = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      normHref(p.href),
    ),
  );
  const names = new Set(
    [...readme.mainProjects, ...readme.utilities, ...readme.miniapps].map((p) =>
      p.name.toLowerCase(),
    ),
  );
  return resumePrintProjects.filter((p) => {
    const href = p.href.trim();
    if (!href) {
      return !names.has(p.name.toLowerCase());
    }
    const norm = normHref(href);
    return !hrefs.has(norm) && !names.has(p.name.toLowerCase());
  });
}
