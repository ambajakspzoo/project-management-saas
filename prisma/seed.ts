import { Prisma, PrismaClient, ProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0);
  return date;
}

const teamMemberData = [
  { name: "Alice Chen", email: "alice.chen@example.com" },
  { name: "Bob Martinez", email: "bob.martinez@example.com" },
  { name: "Carol Williams", email: "carol.williams@example.com" },
  { name: "David Kim", email: "david.kim@example.com" },
  { name: "Elena Rodriguez", email: "elena.rodriguez@example.com" },
  { name: "Frank O'Brien", email: "frank.obrien@example.com" },
  { name: "Grace Nakamura", email: "grace.nakamura@example.com" },
  { name: "Henry Patel", email: "henry.patel@example.com" },
  { name: "Iris Johansson", email: "iris.johansson@example.com" },
  { name: "James Wilson", email: "james.wilson@example.com" },
];

type ProjectSeed = {
  title: string;
  description: string;
  status: ProjectStatus;
  deadlineDays: number;
  budget: string;
  teamMemberIndex: number;
};

const projectData: ProjectSeed[] = [
  {
    title: "Customer Portal Redesign",
    description:
      "Modernize the self-service portal with a new UI and improved onboarding.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 45,
    budget: "85000.00",
    teamMemberIndex: 0,
  },
  {
    title: "Mobile App v2",
    description: "Native iOS and Android release with offline support.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 90,
    budget: "120000.00",
    teamMemberIndex: 1,
  },
  {
    title: "API Gateway Migration",
    description: "Move legacy services behind a unified API gateway.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 14,
    budget: "42000.50",
    teamMemberIndex: 2,
  },
  {
    title: "Data Warehouse ETL",
    description:
      "Pipeline for nightly analytics ingestion from production DBs.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 60,
    budget: "67500.00",
    teamMemberIndex: 3,
  },
  {
    title: "Security Audit Remediation",
    description: "Address findings from the Q1 penetration test.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 7,
    budget: "28000.00",
    teamMemberIndex: 4,
  },
  {
    title: "HR Onboarding Automation",
    description: "Workflow tooling for new hire provisioning and training.",
    status: ProjectStatus.ON_HOLD,
    deadlineDays: 120,
    budget: "35000.00",
    teamMemberIndex: 5,
  },
  {
    title: "Legacy CRM Integration",
    description: "Bidirectional sync with the on-prem CRM system.",
    status: ProjectStatus.ON_HOLD,
    deadlineDays: -10,
    budget: "91000.00",
    teamMemberIndex: 6,
  },
  {
    title: "Chatbot Pilot",
    description: "AI support bot for tier-1 customer inquiries.",
    status: ProjectStatus.ON_HOLD,
    deadlineDays: 30,
    budget: "22000.75",
    teamMemberIndex: 7,
  },
  {
    title: "Office Relocation IT",
    description: "Network and hardware setup for the new headquarters.",
    status: ProjectStatus.ON_HOLD,
    deadlineDays: -30,
    budget: "15500.00",
    teamMemberIndex: 8,
  },
  {
    title: "Website Rebrand",
    description: "New brand guidelines applied across marketing site.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -60,
    budget: "48000.00",
    teamMemberIndex: 0,
  },
  {
    title: "SOC 2 Type II Prep",
    description: "Documentation and controls for compliance certification.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -90,
    budget: "72000.00",
    teamMemberIndex: 1,
  },
  {
    title: "Inventory Management System",
    description: "Warehouse tracking and reorder automation.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -45,
    budget: "54000.25",
    teamMemberIndex: 2,
  },
  {
    title: "Employee Benefits Portal",
    description: "Self-service enrollment and benefits comparison tools.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -120,
    budget: "31000.00",
    teamMemberIndex: 3,
  },
  {
    title: "Payment Gateway Upgrade",
    description: "PCI-compliant processor migration with zero downtime.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -15,
    budget: "89000.00",
    teamMemberIndex: 4,
  },
  {
    title: "Internal Wiki Migration",
    description: "Move Confluence spaces to the new knowledge base.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 21,
    budget: "12500.00",
    teamMemberIndex: 5,
  },
  {
    title: "Sales Dashboard",
    description: "Real-time KPI dashboard for the revenue team.",
    status: ProjectStatus.ACTIVE,
    deadlineDays: 35,
    budget: "38000.00",
    teamMemberIndex: 6,
  },
  {
    title: "Vendor Risk Assessment",
    description: "Third-party security questionnaires and scoring.",
    status: ProjectStatus.ON_HOLD,
    deadlineDays: 75,
    budget: "19500.50",
    teamMemberIndex: 7,
  },
  {
    title: "Email Campaign Platform",
    description: "Migrate newsletters to a new marketing automation tool.",
    status: ProjectStatus.COMPLETED,
    deadlineDays: -200,
    budget: "26000.00",
    teamMemberIndex: 9,
  },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();

  console.log("Seeding team members...");
  const teamMembers = await Promise.all(
    teamMemberData.map((member) => prisma.teamMember.create({ data: member })),
  );

  console.log("Seeding projects...");
  await prisma.project.createMany({
    data: projectData.map((project) => ({
      title: project.title,
      description: project.description,
      status: project.status,
      deadline: daysFromNow(project.deadlineDays),
      budget: new Prisma.Decimal(project.budget),
      teamMemberId: teamMembers[project.teamMemberIndex].id,
    })),
  });

  const [memberCount, projectCount] = await Promise.all([
    prisma.teamMember.count(),
    prisma.project.count(),
  ]);

  console.log(
    `Seeded ${memberCount} team members and ${projectCount} projects.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
