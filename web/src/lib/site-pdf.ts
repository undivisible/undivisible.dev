export type SitePdfTarget = "resume" | "brief";

const PDF_FILE_NAMES: Record<SitePdfTarget, string> = {
  resume: "max-carter-resume.pdf",
  brief: "max-carter-brief.pdf",
};

export function sitePdfFileName(target: SitePdfTarget) {
  return PDF_FILE_NAMES[target];
}
