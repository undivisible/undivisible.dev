import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { briefOpenSourceCards } from "@/lib/brief-open-source";
import { resumeDoc } from "@/data/resume-document";
import { lifeTimeline } from "@/data/life-timeline";
import {
  getReadmeBundleFromGenerated,
  type ReadmeProject,
} from "@/lib/profile-readme";
import {
  resumeItemBlurb,
  resumeItemKey,
  type ResumeListItem,
} from "@/lib/parse-resume-markdown";

const C = {
  cream: "#fff8e6",
  orange: "#ff5705",
  black: "#0a0a0a",
  mid: "#4e4e4e",
  rule: "#e2d9c4",
  bgAlt: "#f4ecda",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.cream,
    color: C.black,
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.34,
    padding: 18,
  },
  darkPage: {
    backgroundColor: C.black,
    color: C.cream,
  },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: C.orange,
    paddingBottom: 6,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    textTransform: "uppercase",
    color: C.orange,
  },
  footer: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 10,
    borderTopWidth: 1,
    borderTopColor: C.rule,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    color: C.mid,
  },
  footerDark: {
    borderTopColor: "#3a241b",
    color: "#9c8f86",
  },
  h1: {
    fontSize: 35,
    lineHeight: 0.96,
    color: C.orange,
    marginBottom: 10,
  },
  h2: {
    fontSize: 14,
    lineHeight: 1.08,
    marginBottom: 7,
  },
  h3: {
    fontSize: 8,
    textTransform: "uppercase",
    color: C.orange,
    marginBottom: 5,
  },
  muted: {
    color: C.mid,
  },
  mutedDark: {
    color: "#b9a99c",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: C.rule,
    backgroundColor: "#fffdf4",
    borderRadius: 4,
    padding: 7,
    marginBottom: 6,
  },
  darkCard: {
    borderColor: "#3a241b",
    backgroundColor: "#16110e",
  },
  orangeCard: {
    backgroundColor: C.orange,
    borderColor: C.orange,
    color: C.black,
  },
  title: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  small: {
    fontSize: 6.7,
  },
  tiny: {
    fontSize: 5.8,
  },
  link: {
    color: C.orange,
    textDecoration: "none",
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  half: {
    width: "48.7%",
  },
  grid3: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  third: {
    width: "32.1%",
  },
  stat: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: C.orange,
    paddingTop: 5,
  },
});

type PrintProject = ReadmeProject | ResumeListItem;

type PrintProjectSection = {
  title: string;
  items: PrintProject[];
};

function PageFrame({
  title,
  page,
  total,
  dark,
  children,
}: {
  title: string;
  page: number;
  total: number;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={[styles.page, dark ? styles.darkPage : {}]}>
      <View style={styles.topBar}>
        <Text>{title}</Text>
        <Text>undivisible.dev</Text>
      </View>
      {children}
      <View style={[styles.footer, dark ? styles.footerDark : {}]} fixed>
        <Text>Max Carter</Text>
        <Text>
          undivisible.dev · {page}/{total}
        </Text>
      </View>
    </Page>
  );
}

function contactHref(label: string, value: string) {
  if (label === "Email") return `mailto:${value}`;
  if (label === "Phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (label === "Instagram") return "https://instagram.com/undivisible.dev";
  if (label === "Twitter") return "https://x.com/makethings4ppl";
  if (label === "GitHub") return `https://${value}`;
  return null;
}

function projectHref(item: PrintProject) {
  return "href" in item ? item.href : undefined;
}

function projectName(item: PrintProject) {
  return "name" in item ? item.name : resumeItemKey(item);
}

function projectDesc(item: PrintProject) {
  return "desc" in item ? item.desc : resumeItemBlurb(item);
}

function projectStack(item: PrintProject) {
  return "stack" in item ? item.stack : undefined;
}

function websiteProjectSections(): PrintProjectSection[] {
  const readme = getReadmeBundleFromGenerated();
  const companyProjects = resumeDoc.experience.flatMap((job) =>
    job.subsections.map((section) => ({
      title: `${job.org} / ${section.title}`,
      items: section.items,
    })),
  );

  return [
    ...companyProjects,
    { title: "Flagship Open Source", items: readme.mainProjects },
    { title: "Libraries", items: readme.libraries },
    { title: "Utilities", items: readme.utilities },
    { title: "Miniapps", items: readme.miniapps },
  ].filter((section) => section.items.length > 0);
}

function ContactRows() {
  return (
    <View style={styles.grid2}>
      {resumeDoc.contact.map((row) => {
        const [label, value] = row;
        const href = contactHref(label, value);
        return (
          <View key={label} style={[styles.card, styles.half]}>
            <Text style={styles.tiny}>{label}</Text>
            {href ? (
              <Link src={href} style={[styles.link, styles.small]}>
                {value}
              </Link>
            ) : (
              <Text style={styles.small}>{value}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ProjectCard({ item, dark }: { item: PrintProject; dark?: boolean }) {
  const href = projectHref(item);
  const body = (
    <View style={[styles.card, dark ? styles.darkCard : {}, styles.third]}>
      <Text style={[styles.title, dark ? { color: C.cream } : {}]}>
        {projectName(item)}
      </Text>
      <Text style={[styles.small, dark ? styles.mutedDark : styles.muted]}>
        {projectDesc(item)}
      </Text>
      {projectStack(item) ? (
        <Text style={[styles.tiny, { color: C.orange, marginTop: 3 }]}>
          {projectStack(item)}
        </Text>
      ) : null}
    </View>
  );

  return href ? (
    <Link key={projectName(item)} src={href} style={{ textDecoration: "none" }}>
      {body}
    </Link>
  ) : (
    body
  );
}

function ResumeDocument() {
  const projectSections = websiteProjectSections();
  const featuredProjects = projectSections
    .flatMap((section) => section.items)
    .slice(0, 18);
  const remainingSections = projectSections.slice(0, 6);

  return (
    <Document
      title="Max Carter Resume"
      author="Max Carter"
      subject="Resume"
      creator="undivisible.dev"
    >
      <PageFrame title="Resume" page={1} total={2}>
        <View style={styles.row}>
          <View style={{ width: "57%" }}>
            <Text style={styles.h1}>Max Carter</Text>
            <Text style={[styles.h2, { marginBottom: 10 }]}>
              Builder across AI automation, web products, open-source systems,
              runtimes, and unusual software.
            </Text>
            <ContactRows />
          </View>
          <View style={{ width: "41%" }}>
            <Text style={styles.h3}>Skills</Text>
            {resumeDoc.skills.map((skill) => (
              <View key={skill[0]} style={styles.card}>
                <Text style={styles.title}>{skill[0]}</Text>
                <Text style={styles.small}>{skill[1]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.h3}>Experience</Text>
          {resumeDoc.experience.map((job) => (
            <View key={`${job.role}-${job.org}`} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.title}>{job.role}</Text>
                  <Text style={[styles.small, { color: C.orange }]}>
                    {job.org}
                  </Text>
                </View>
                <Text style={styles.small}>{job.time}</Text>
              </View>
              {job.bullets.map((point) => (
                <Text key={point} style={[styles.small, styles.muted]}>
                  • {point}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 4 }}>
          <Text style={styles.h3}>Featured work</Text>
          <View style={styles.grid3}>
            {featuredProjects.map((item) => (
              <ProjectCard key={projectName(item)} item={item} />
            ))}
          </View>
        </View>
      </PageFrame>

      <PageFrame title="Resume / Project Index" page={2} total={2} dark>
        <Text style={[styles.h2, { color: C.cream }]}>
          Public project index and supporting work
        </Text>
        {remainingSections.map((section) => (
          <View key={section.title} style={{ marginBottom: 8 }}>
            <Text style={styles.h3}>{section.title}</Text>
            <View style={styles.grid3}>
              {section.items.slice(0, 9).map((item) => (
                <ProjectCard
                  key={`${section.title}-${projectName(item)}`}
                  item={item}
                  dark
                />
              ))}
            </View>
          </View>
        ))}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.h3}>Education</Text>
            {resumeDoc.education.map((item) => (
              <Text key={item} style={styles.mutedDark}>
                • {item}
              </Text>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.h3}>Languages / Community</Text>
            {[...resumeDoc.humanLanguages, ...resumeDoc.community].map(
              (item) => (
                <Text key={item} style={styles.mutedDark}>
                  • {item}
                </Text>
              ),
            )}
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

function BriefServicesPage() {
  const services = [
    [
      "01 / Micro-Startup Studio",
      "Idea to live product",
      "Working, designed, deployable products from napkin-sketch concepts and awkward product gaps.",
    ],
    [
      "02 / AI Automation",
      "Remove the busywork",
      "Agents and integrations for reception, quote generation, broker pipelines, client comms, intake, and reporting.",
    ],
    [
      "03 / Bespoke Web & Apps",
      "Distinct digital surfaces",
      "WebGL, spatial interfaces, eCommerce, dashboards, and native-feeling apps built around the business.",
    ],
    [
      "04 / Complex & Unusual",
      "Hard systems work",
      "Operating systems, compilers, package managers, browser extensions, AI agents, and custom runtimes.",
    ],
  ];
  const stats = [
    ["9 yrs", "Building software since age 8"],
    ["40+", "Open source repos"],
    ["5+", "Languages spoken"],
    ["∞", "Unusual requests welcome"],
  ];

  return (
    <PageFrame title="Services Overview" page={1} total={3}>
      <View style={{ backgroundColor: C.black, padding: 18, marginBottom: 12 }}>
        <Text style={[styles.tiny, { color: C.orange, marginBottom: 7 }]}>
          Max Carter · Builder · Melbourne / Sydney / Hong Kong
        </Text>
        <Text style={styles.h1}>Building the unthought of.</Text>
        <Text style={[styles.small, { color: C.cream }]}>
          Bespoke software, AI automation, unusual web surfaces, and systems
          work for founders and operators.
        </Text>
      </View>
      <View style={[styles.row, { marginBottom: 12 }]}>
        {stats.map(([value, label]) => (
          <View key={value} style={styles.stat}>
            <Text style={[styles.h2, { color: C.orange }]}>{value}</Text>
            <Text style={styles.small}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.h3}>What I do</Text>
      <View style={styles.grid2}>
        {services.map(([n, t, b]) => (
          <View key={n} style={[styles.card, styles.half]}>
            <Text style={[styles.tiny, { color: C.orange }]}>{n}</Text>
            <Text style={styles.title}>{t}</Text>
            <Text style={[styles.small, styles.muted]}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={styles.h3}>Contact</Text>
        <ContactRows />
      </View>
    </PageFrame>
  );
}

function BriefCasesPage() {
  const cases = [
    [
      "Operational Audit",
      "Projected ~50% headcount reduction",
      "Mapped subcontractor hours against rule-based workflows, then designed an AI agent layer for broker quotes, client email, document routing, and intake.",
    ],
    [
      "Voice + Intake Automation",
      "$70,000 / year recovered",
      "Identified dispatch, qualification, and receptionist triage as rule-based payroll spend, then deployed AI phone agents and automated intake pipelines.",
    ],
    [
      "One-click CMA",
      "7 hours per listing to under 1 minute",
      "Built a browser extension for one-click comparative market analysis with live aggregation and structured report output.",
    ],
    [
      "Graft AI Website",
      "Conversational automation funnel",
      "Built a live automation intake surface with prompts, voice entry, booking handoff, tool streaming, and onboarding paths.",
    ],
    [
      "Automotive Aftermarket",
      "Brand, commerce, packaging, apps",
      "Reworked brand system, product packaging, bespoke commerce surface, and companion app direction.",
    ],
  ];
  const techRows = [
    "Rust, Swift, TypeScript, Go, Python, C / C#",
    "React, Next.js, Svelte, Solid, React Native, WebGL, WASM",
    "PostgreSQL, SQLite, Supabase, Cloudflare, Docker, GitHub Actions",
    "OpenAI, MCP, RAG, local models, Hugging Face, browser extensions",
  ];

  return (
    <PageFrame title="Case Studies" page={2} total={3} dark>
      <Text style={[styles.h2, { color: C.cream }]}>
        Examples across automation, product, and systems.
      </Text>
      {cases.map(([label, title, body], index) => (
        <View key={label} style={[styles.card, styles.darkCard]}>
          <Text style={[styles.tiny, { color: C.orange }]}>
            0{index + 1} · {label}
          </Text>
          <Text style={[styles.title, { color: C.cream }]}>{title}</Text>
          <Text style={[styles.small, styles.mutedDark]}>{body}</Text>
        </View>
      ))}
      <Text style={styles.h3}>Technical range</Text>
      {techRows.map((row) => (
        <Text
          key={row}
          style={[styles.card, styles.darkCard, styles.mutedDark]}
        >
          {row}
        </Text>
      ))}
    </PageFrame>
  );
}

function BriefOpenSourcePage() {
  const cards = briefOpenSourceCards();

  return (
    <PageFrame title="Open Source" page={3} total={3}>
      <Text style={styles.h2}>Open-source systems and public work</Text>
      <View style={styles.grid2}>
        {cards.map((card) => (
          <View
            key={card.name}
            style={[
              styles.card,
              styles.half,
              card.dark ? styles.darkCard : {},
              card.accent ? { borderColor: C.orange } : {},
            ]}
          >
            <Text style={[styles.tiny, { color: C.orange }]}>
              {card.org} · {card.tag}
            </Text>
            <Text style={[styles.title, card.dark ? { color: C.cream } : {}]}>
              {card.name}
            </Text>
            <Text
              style={[
                styles.small,
                card.dark ? styles.mutedDark : styles.muted,
              ]}
            >
              {card.desc}
            </Text>
            <Text style={[styles.tiny, { color: C.orange, marginTop: 3 }]}>
              {card.tech}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 10 }}>
        <Text style={styles.h3}>Public story beats</Text>
        <View style={styles.grid3}>
          {lifeTimeline.map((beat) => (
            <View key={beat.age} style={[styles.card, styles.third]}>
              <Text style={[styles.tiny, { color: C.orange }]}>
                age {beat.age}
              </Text>
              <Text style={styles.title}>{beat.title}</Text>
              <Text style={[styles.small, styles.muted]}>{beat.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </PageFrame>
  );
}

function BriefDocument() {
  return (
    <Document
      title="Max Carter Brief"
      author="Max Carter"
      subject="Services and portfolio brief"
      creator="undivisible.dev"
    >
      <BriefServicesPage />
      <BriefCasesPage />
      <BriefOpenSourcePage />
    </Document>
  );
}

export function SitePdfDocument({ target }: { target: "resume" | "brief" }) {
  return target === "resume" ? <ResumeDocument /> : <BriefDocument />;
}
