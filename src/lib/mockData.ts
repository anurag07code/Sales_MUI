// Mock Data for SalesFirst Application
import { RFP_RESULT_DATA } from "./data/rfpResult";

export const MOCK_COMPANY_LIST = [
  {
    id: "1",
    name: "TechCorp Global",
    region: "North America",
    country: "United States",
    rank: 1,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TC&backgroundColor=38bdf8",
  },
  {
    id: "2",
    name: "InnovateLabs",
    region: "Europe",
    country: "Germany",
    rank: 2,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=IL&backgroundColor=34d399",
  },
  {
    id: "3",
    name: "FutureSoft Systems",
    region: "Asia",
    country: "Singapore",
    rank: 3,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=FS&backgroundColor=f59e0b",
  },
  {
    id: "4",
    name: "DataVision Inc",
    region: "North America",
    country: "Canada",
    rank: 4,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DV&backgroundColor=8b5cf6",
  },
  {
    id: "5",
    name: "CloudPrime Solutions",
    region: "Europe",
    country: "United Kingdom",
    rank: 5,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CP&backgroundColor=ec4899",
  },
  {
    id: "6",
    name: "AI Dynamics",
    region: "Asia",
    country: "Japan",
    rank: 6,
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=06b6d4",
  },
];

export const MOCK_COMPANY_DETAILS = {
  "1": {
    name: "TechCorp Global",
    industry: "Enterprise Software & Cloud Solutions",
    founded: "2008",
    headquarters: "San Francisco, CA, United States",
    description:
      "TechCorp Global is a leading provider of enterprise software solutions, specializing in cloud infrastructure, AI-powered analytics, and digital transformation services. With over 50,000 employees worldwide, the company serves Fortune 500 clients across multiple industries.",
    news: [
      {
        title: "TechCorp Announces Q4 Revenue Growth of 28%",
        date: "2025-01-15",
        source: "TechCrunch",
      },
      {
        title: "New AI Platform Launch Expected in Q2 2025",
        date: "2025-01-10",
        source: "VentureBeat",
      },
      {
        title: "Strategic Partnership with Global Bank Consortium",
        date: "2024-12-20",
        source: "Forbes",
      },
    ],
    keyCustomers: [
      "Goldman Sachs",
      "General Electric",
      "Siemens",
      "Toyota",
      "Volkswagen",
      "Shell Energy",
    ],
    stockData: [
      { date: "Jan", value: 145 },
      { date: "Feb", value: 152 },
      { date: "Mar", value: 148 },
      { date: "Apr", value: 161 },
      { date: "May", value: 158 },
      { date: "Jun", value: 167 },
      { date: "Jul", value: 173 },
      { date: "Aug", value: 169 },
      { date: "Sep", value: 178 },
      { date: "Oct", value: 185 },
    ],
  },
};

export const MOCK_RFP_PROJECTS = [
  {
    id: "1",
    rfpTitle: "Enterprise Cloud Migration & AI Integration Project",
    uploadedFileName: "RFP_CloudMigration_2025.pdf",
    tabs: [
      {
        title: "Project Scope",
        icon: "Target",
        sections: [
          {
            heading: "Objectives",
            content:
              "Complete migration of legacy systems to cloud infrastructure with integrated AI analytics capabilities. Modernize 15+ applications serving 10,000+ users globally.",
          },
          {
            heading: "Technical Requirements",
            content:
              "Multi-cloud architecture (AWS, Azure), microservices design, API-first approach, real-time data processing, advanced security protocols (SOC 2, ISO 27001 compliance).",
          },
          {
            heading: "Deliverables",
            content:
              "Fully migrated cloud infrastructure, custom AI analytics dashboard, comprehensive documentation, training materials, 12-month support plan.",
          },
        ],
      },
      {
        title: "Timelines & Milestones",
        icon: "Calendar",
        sections: [
          {
            heading: "Phase 1: Discovery & Planning",
            content: "Duration: 6 weeks. Requirements gathering, architecture design, risk assessment.",
          },
          {
            heading: "Phase 2: Migration & Development",
            content: "Duration: 20 weeks. Incremental migration, AI platform development, testing.",
          },
          {
            heading: "Phase 3: Deployment & Training",
            content: "Duration: 8 weeks. Production deployment, user training, documentation handoff.",
          },
        ],
      },
      {
        title: "Budget & Resources",
        icon: "DollarSign",
        sections: [
          {
            heading: "Estimated Budget",
            content: "$2.8M - $3.5M (including infrastructure, licensing, professional services).",
          },
          {
            heading: "Team Composition",
            content:
              "12-15 FTE: Cloud architects (3), Backend developers (4), AI/ML engineers (2), DevOps (2), QA (2), Project Manager (1).",
          },
          {
            heading: "Technology Stack",
            content:
              "AWS/Azure, Kubernetes, Python, Node.js, TensorFlow, React, PostgreSQL, Redis.",
          },
        ],
      },
      {
        title: "Risk & Complexities",
        icon: "AlertTriangle",
        sections: [
          {
            heading: "Technical Risks",
            content:
              "Data migration integrity, system downtime during cutover, integration with legacy APIs.",
          },
          {
            heading: "Business Risks",
            content: "User adoption challenges, regulatory compliance delays, budget overruns.",
          },
          {
            heading: "Mitigation Strategies",
            content:
              "Phased rollout approach, comprehensive testing protocols, dedicated change management team, contingency budget allocation.",
          },
        ],
      },
    ],
    journeyBlocks: [
      { name: "RFP Received", status: "completed" as const, icon: "FileText" },
      { name: "Initial Analysis", status: "completed" as const, icon: "Search" },
      { name: "Scope Definition", status: "completed" as const, icon: "Target" },
      { name: "Cost Estimation", status: "in-progress" as const, icon: "Calculator" },
      { name: "Resource Planning", status: "in-progress" as const, icon: "Users" },
      { name: "Risk Assessment", status: "pending" as const, icon: "AlertTriangle" },
      { name: "Summary Estimation", status: "pending" as const, icon: "ListChecks" },
      { name: "Proposal Draft", status: "pending" as const, icon: "FileEdit" },
      { name: "Final Approval", status: "pending" as const, icon: "CheckCircle" },
      { name: "Submission", status: "pending" as const, icon: "Send" },
    ],
  },
  {
    id: "2",
    rfpTitle: "Digital Transformation & ERP Integration",
    uploadedFileName: "RFP_ERP_DigitalTransform_2025.pdf",
    tabs: [
      {
        title: "Project Scope",
        icon: "Target",
        sections: [
          {
            heading: "Objectives",
            content:
              "Implement comprehensive ERP solution with digital transformation initiatives. Integrate 20+ business systems and streamline operations across 5 divisions.",
          },
          {
            heading: "Technical Requirements",
            content:
              "SAP S/4HANA implementation, API gateway, data warehousing, business intelligence platform, mobile applications.",
          },
          {
            heading: "Deliverables",
            content:
              "Fully integrated ERP system, BI dashboards, mobile apps, training program, 18-month support.",
          },
        ],
      },
      {
        title: "Timelines & Milestones",
        icon: "Calendar",
        sections: [
          {
            heading: "Phase 1: Analysis & Design",
            content: "Duration: 8 weeks. Requirements analysis, system design, gap analysis.",
          },
          {
            heading: "Phase 2: Implementation",
            content: "Duration: 24 weeks. System configuration, data migration, integration development.",
          },
          {
            heading: "Phase 3: Testing & Go-Live",
            content: "Duration: 10 weeks. User acceptance testing, training, production deployment.",
          },
        ],
      },
      {
        title: "Budget & Resources",
        icon: "DollarSign",
        sections: [
          {
            heading: "Estimated Budget",
            content: "$4.2M - $5.1M (including software licensing, implementation, training).",
          },
          {
            heading: "Team Composition",
            content:
              "18-20 FTE: SAP consultants (5), Integration specialists (4), BI developers (3), QA (3), Change management (2), Project Manager (1).",
          },
          {
            heading: "Technology Stack",
            content:
              "SAP S/4HANA, SAP Fiori, SAP BW/4HANA, SAP PI/PO, Tableau, Azure cloud.",
          },
        ],
      },
      {
        title: "Risk & Complexities",
        icon: "AlertTriangle",
        sections: [
          {
            heading: "Technical Risks",
            content:
              "Complex data migration from legacy systems, integration challenges, performance issues.",
          },
          {
            heading: "Business Risks",
            content: "User resistance to change, business process disruption, timeline delays.",
          },
          {
            heading: "Mitigation Strategies",
            content:
              "Phased implementation, comprehensive training, dedicated support team, change management program.",
          },
        ],
      },
    ],
    journeyBlocks: [
      { name: "RFP Received", status: "completed" as const, icon: "FileText" },
      { name: "Initial Analysis", status: "completed" as const, icon: "Search" },
      { name: "Scope Definition", status: "completed" as const, icon: "Target" },
      { name: "Cost Estimation", status: "completed" as const, icon: "Calculator" },
      { name: "Resource Planning", status: "completed" as const, icon: "Users" },
      { name: "Risk Assessment", status: "in-progress" as const, icon: "AlertTriangle" },
      { name: "Summary Estimation", status: "pending" as const, icon: "ListChecks" },
      { name: "Proposal Draft", status: "pending" as const, icon: "FileEdit" },
      { name: "Final Approval", status: "pending" as const, icon: "CheckCircle" },
      { name: "Submission", status: "pending" as const, icon: "Send" },
    ],
  },
  {
    id: "3",
    rfpTitle: "Cybersecurity & Compliance Platform",
    uploadedFileName: "RFP_CyberSecurity_2025.pdf",
    tabs: [
      {
        title: "Project Scope",
        icon: "Target",
        sections: [
          {
            heading: "Objectives",
            content:
              "Deploy enterprise-grade cybersecurity platform with compliance monitoring. Protect infrastructure and ensure GDPR, HIPAA, and SOX compliance.",
          },
          {
            heading: "Technical Requirements",
            content:
              "SIEM platform, threat intelligence, endpoint protection, identity management, compliance automation tools.",
          },
          {
            heading: "Deliverables",
            content:
              "Security operations center setup, compliance dashboard, incident response framework, security training, 24/7 monitoring.",
          },
        ],
      },
      {
        title: "Timelines & Milestones",
        icon: "Calendar",
        sections: [
          {
            heading: "Phase 1: Assessment & Planning",
            content: "Duration: 4 weeks. Security audit, risk assessment, architecture design.",
          },
          {
            heading: "Phase 2: Deployment",
            content: "Duration: 12 weeks. Tool deployment, configuration, integration setup.",
          },
          {
            heading: "Phase 3: Optimization & Training",
            content: "Duration: 6 weeks. Fine-tuning, team training, documentation.",
          },
        ],
      },
      {
        title: "Budget & Resources",
        icon: "DollarSign",
        sections: [
          {
            heading: "Estimated Budget",
            content: "$1.5M - $2.2M (including software licenses, hardware, professional services).",
          },
          {
            heading: "Team Composition",
            content:
              "8-10 FTE: Security architects (2), Security analysts (3), Compliance specialists (2), Project Manager (1).",
          },
          {
            heading: "Technology Stack",
            content:
              "Splunk, CrowdStrike, Okta, Qualys, Microsoft Defender, Compliance automation tools.",
          },
        ],
      },
      {
        title: "Risk & Complexities",
        icon: "AlertTriangle",
        sections: [
          {
            heading: "Technical Risks",
            content:
              "Integration complexity, false positives, performance impact on systems.",
          },
          {
            heading: "Business Risks",
            content: "Regulatory changes, evolving threat landscape, resource constraints.",
          },
          {
            heading: "Mitigation Strategies",
            content:
              "Staged rollout, continuous monitoring, regular updates, dedicated security team.",
          },
        ],
      },
    ],
    journeyBlocks: [
      { name: "RFP Received", status: "completed" as const, icon: "FileText" },
      { name: "Initial Analysis", status: "in-progress" as const, icon: "Search" },
      { name: "Scope Definition", status: "pending" as const, icon: "Target" },
      { name: "Cost Estimation", status: "pending" as const, icon: "Calculator" },
      { name: "Resource Planning", status: "pending" as const, icon: "Users" },
      { name: "Risk Assessment", status: "pending" as const, icon: "AlertTriangle" },
      { name: "Summary Estimation", status: "pending" as const, icon: "ListChecks" },
      { name: "Proposal Draft", status: "pending" as const, icon: "FileEdit" },
      { name: "Final Approval", status: "pending" as const, icon: "CheckCircle" },
      { name: "Submission", status: "pending" as const, icon: "Send" },
    ],
  },
  {
    id: "4",
    rfpTitle: "SBI Internet Banking Kiosks & Account Opening Tabs",
    uploadedFileName: RFP_RESULT_DATA.file_name,
    tabs: [],
    journeyBlocks: [
      { name: "RFP Received", status: "completed" as const, icon: "FileText" },
      { name: "Initial Analysis", status: "completed" as const, icon: "Search" },
      { name: "Scope Definition", status: "completed" as const, icon: "Target" },
      { name: "Cost Estimation", status: "completed" as const, icon: "Calculator" },
      { name: "Resource Planning", status: "completed" as const, icon: "Users" },
      { name: "Risk Assessment", status: "completed" as const, icon: "AlertTriangle" },
      { name: "Summary Estimation", status: "in-progress" as const, icon: "ListChecks" },
      { name: "Proposal Draft", status: "pending" as const, icon: "FileEdit" },
      { name: "Final Approval", status: "pending" as const, icon: "CheckCircle" },
      { name: "Submission", status: "pending" as const, icon: "Send" },
    ],
    rfpEstimation: RFP_RESULT_DATA.rfp_estimation,
  },
];

export const MOCK_RFP_SUMMARY = {
  rfpTitle: "Enterprise Cloud Migration & AI Integration Project",
  uploadedFileName: "RFP_CloudMigration_2025.pdf",
  tabs: [
    {
      title: "Project Scope",
      icon: "Target",
      sections: [
        {
          heading: "Objectives",
          content:
            "Complete migration of legacy systems to cloud infrastructure with integrated AI analytics capabilities. Modernize 15+ applications serving 10,000+ users globally.",
        },
        {
          heading: "Technical Requirements",
          content:
            "Multi-cloud architecture (AWS, Azure), microservices design, API-first approach, real-time data processing, advanced security protocols (SOC 2, ISO 27001 compliance).",
        },
        {
          heading: "Deliverables",
          content:
            "Fully migrated cloud infrastructure, custom AI analytics dashboard, comprehensive documentation, training materials, 12-month support plan.",
        },
      ],
    },
    {
      title: "Timelines & Milestones",
      icon: "Calendar",
      sections: [
        {
          heading: "Phase 1: Discovery & Planning",
          content: "Duration: 6 weeks. Requirements gathering, architecture design, risk assessment.",
        },
        {
          heading: "Phase 2: Migration & Development",
          content: "Duration: 20 weeks. Incremental migration, AI platform development, testing.",
        },
        {
          heading: "Phase 3: Deployment & Training",
          content: "Duration: 8 weeks. Production deployment, user training, documentation handoff.",
        },
      ],
    },
    {
      title: "Budget & Resources",
      icon: "DollarSign",
      sections: [
        {
          heading: "Estimated Budget",
          content: "$2.8M - $3.5M (including infrastructure, licensing, professional services).",
        },
        {
          heading: "Team Composition",
          content:
            "12-15 FTE: Cloud architects (3), Backend developers (4), AI/ML engineers (2), DevOps (2), QA (2), Project Manager (1).",
        },
        {
          heading: "Technology Stack",
          content:
            "AWS/Azure, Kubernetes, Python, Node.js, TensorFlow, React, PostgreSQL, Redis.",
        },
      ],
    },
    {
      title: "Risk & Complexities",
      icon: "AlertTriangle",
      sections: [
        {
          heading: "Technical Risks",
          content:
            "Data migration integrity, system downtime during cutover, integration with legacy APIs.",
        },
        {
          heading: "Business Risks",
          content: "User adoption challenges, regulatory compliance delays, budget overruns.",
        },
        {
          heading: "Mitigation Strategies",
          content:
            "Phased rollout approach, comprehensive testing protocols, dedicated change management team, contingency budget allocation.",
        },
      ],
    },
  ],
  journeyBlocks: [
    { name: "RFP Received", status: "completed" as const, icon: "FileText" },
    { name: "Initial Analysis", status: "completed" as const, icon: "Search" },
    { name: "Scope Definition", status: "completed" as const, icon: "Target" },
    { name: "Cost Estimation", status: "in-progress" as const, icon: "Calculator" },
    { name: "Resource Planning", status: "in-progress" as const, icon: "Users" },
    { name: "Risk Assessment", status: "pending" as const, icon: "AlertTriangle" },
    { name: "Summary Estimation", status: "pending" as const, icon: "ListChecks" },
    { name: "Proposal Draft", status: "pending" as const, icon: "FileEdit" },
    { name: "Final Approval", status: "pending" as const, icon: "CheckCircle" },
    { name: "Submission", status: "pending" as const, icon: "Send" },
  ],
};
