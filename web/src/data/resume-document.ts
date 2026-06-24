import type { ResumeDocument } from "@/lib/parse-resume-markdown";
import { resumeFromMarkdown } from "@/data/resume-from-markdown.generated";
import {
  contactDisplayUsername,
  contactHref,
} from "@/lib/resume-contact";

export type { ResumeContactRow } from "@/lib/parse-resume-markdown";

const resumeDoc = resumeFromMarkdown as unknown as ResumeDocument;

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

export function resumeContactValue(
  doc: ResumeDocument,
  label: string,
): string | undefined {
  return doc.contact.find(([l]) => l === label)?.[1];
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