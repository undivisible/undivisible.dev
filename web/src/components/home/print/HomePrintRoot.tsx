import { Tb } from "@/components/brief/ui/Tb";
import {
  getReadmeBundleFromGenerated,
  resumePrintProjectSections,
  type ReadmeBundle,
} from "@/lib/profile-readme";
import {
  getCachedResumeDocument,
  type PrintProjectSection,
} from "@/components/home/print/print-document";
import { C, mono } from "@/components/brief/ui/constants";
import {
  CHROME,
  EXP_PAGE,
  PRINT_RESUME_STYLES,
} from "@/components/home/print/print-metrics";
import { PrintPage } from "@/components/home/print/print-page";
import { ProjectsPage } from "@/components/home/print/print-projects-page";

import { Bullet, SectionTitle } from "@/components/home/print/print-primitives";
import {
  ProfileSidebar,
  ResumeHeader,
  SubsectionBlock,
} from "@/components/home/print/print-resume-blocks";

const mainrunProject = {
  name: "Mainrun",
  href: "",
  meta: "",
  desc: "Participated in Maincode's machine learning assessment with no prior LLM training experience. Built a complete GPT-style training pipeline from scratch in C++: transformer architecture, tokenizer integration, data pipeline, optimizers, schedulers, checkpointing, and training loop. Achieved ~1.6x faster inference than the reference Python implementation at ~1,900 tokens/second, reduced training step time to ~300 ms for ~1.7x faster training, optimized Apple Silicon performance, memory use, and throughput, reached final validation loss 0.974555, and placed best in the assessment. Also submitted an upstream tooling/scripts fix.",
  descSegments: [],
  stack: "Python, C++.",
};

const oppoFirmwareProject = {
  name: "Oppo Firmware Reverse Engineering",
  href: "",
  meta: "Oppo Firmware Reverse Engineering",
  desc: "Recovered a soft-bricked Oppo/OnePlus device without official documentation. Reverse engineered the vendor flashing utility and firmware validation process, identified model/package validation as the failure source, modified package configuration while preserving compatibility, rebuilt a working package from multiple firmware releases, traced boot loops to the OCDT calibration partition, restored the original backup, and recovered boot, IMEI, and modem functionality.",
  descSegments: [],
  stack: "",
};

function resumePrintSectionsWithAssessmentProjects(
  sections: PrintProjectSection[],
): PrintProjectSection[] {
  return sections.map((section) =>
    section.title === "Flagship projects"
      ? {
          ...section,
          items: [...section.items, mainrunProject, oppoFirmwareProject],
        }
      : section,
  );
}

export function HomePrintRoot({
  readme = getReadmeBundleFromGenerated(),
}: {
  readme?: ReadmeBundle;
}) {
  const doc = getCachedResumeDocument();
  const projectSections = resumePrintSectionsWithAssessmentProjects(
    resumePrintProjectSections(readme),
  );
  const totalPages = 2;

  return (
    <div
      className="print-only"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: C.cream,
      }}
    >
      <style>{PRINT_RESUME_STYLES(C.cream)}</style>

      <PrintPage page={1} total={totalPages}>
        <Tb
          left="RESUME BUILT WITH REACT"
          right={
            <a
              href="https://undivisible.dev"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              undivisible.dev
            </a>
          }
          fontSize={CHROME.tb}
        />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ResumeHeader />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                background: C.cream,
                flex: 1,
                minHeight: 0,
                padding: "14px 26px 12px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SectionTitle fontSize={EXP_PAGE.sectionTitle}>
                Experience
              </SectionTitle>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {doc.experience.map((job) => (
                  <div
                    key={`${job.org}-${job.role}`}
                    style={{
                      borderTop: `1px solid ${C.rule}`,
                      padding: "11px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 8,
                        alignItems: "baseline",
                      }}
                    >
                      <div
                        style={{
                          fontSize: EXP_PAGE.role,
                          fontWeight: 700,
                          color: C.black,
                          lineHeight: 1.12,
                        }}
                      >
                        {job.role}
                        {job.org ? ` · ${job.org}` : ""}
                      </div>
                      {job.time ? (
                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: EXP_PAGE.time,
                            textTransform: "uppercase",
                            color: C.mid,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.time}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 5, display: "grid", gap: 3 }}>
                      {job.bullets.map((point) => (
                        <Bullet key={point} fontSize={EXP_PAGE.bullet}>
                          {point}
                        </Bullet>
                      ))}
                    </div>
                    {job.subsections.map((sub) => (
                      <SubsectionBlock key={sub.title} sub={sub} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <ProfileSidebar />
          </div>
        </div>
      </PrintPage>

      <PrintPage page={2} total={totalPages} surface="alt">
        <Tb
          left={
            <a
              href="https://undivisible.dev/#projects"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Selected projects
            </a>
          }
          right={
            <a
              href="https://undivisible.dev"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Descriptions pulled from GitHub README · project names and top
              tabs clickable
            </a>
          }
          fontSize={CHROME.tb}
        />
        <ProjectsPage sections={projectSections} readme={readme} />
      </PrintPage>
    </div>
  );
}
