import {
  type ResumeContactRow,
  type ResumeDocument,
  type ResumeExperience,
  type ResumeProject,
} from "@/lib/parse-resume-markdown";
import { resumeFromMarkdown } from "@/data/resume-from-markdown.generated";
import {
  contactDisplayUsername,
  contactHref,
} from "@/lib/resume-contact";

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

export { resumeFromMarkdown, resumeDoc, contactHref, contactDisplayUsername };

export type ResumeSocialLink = {
  name: string;
  username: string;
  href: string;
};

const SOCIAL_CONTACT_LABELS: Record<string, string> = {
  Instagram: "instagram",
  Twitter: "twitter",
  Email: "email",
  GitHub: "github",
};

const EXTRA_SOCIAL_LINKS: ResumeSocialLink[] = [
  { name: "tsc.hk", username: "tsc.hk", href: "https://tsc.hk" },
];

export function resumeContactValue(label: string): string | undefined {
  return resumeContact.find(([l]) => l === label)?.[1];
}

export function resumeSocialLinksFrom(
  doc: ResumeDocument = resumeDoc,
): ResumeSocialLink[] {
  return doc.contact
    .filter(([label]) => label in SOCIAL_CONTACT_LABELS)
    .map(([label, value]) => {
      const href = contactHref(label, value);
      if (!href) return null;
      return {
        name: SOCIAL_CONTACT_LABELS[label]!,
        username:
          label === "Email" ? value : contactDisplayUsername(label, value),
        href,
      };
    })
    .filter((x): x is ResumeSocialLink => x !== null)
    .concat(EXTRA_SOCIAL_LINKS);
}

export function resumeSocialLinks(): ResumeSocialLink[] {
  return resumeSocialLinksFrom(resumeDoc);
}


