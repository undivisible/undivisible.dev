import {
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
