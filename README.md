# FIT HUB People Intelligence

> **Future-State Workforce Analytics & Decision-Support Prototype**  
> Built by **M. Fakhri Musyaffa Budiman** as part of the FIT HUB People Analytics and Intelligence Case Study.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 1. Executive Summary & Vision

**FIT HUB People Intelligence** translates the diagnostic findings of the People Analytics case study into an interactive, operationally actionable data product.

Rather than presenting siloed dashboards, the prototype models one unified, closed-loop employee lifecycle:

```text
Vacancy ──> Candidate ──> Funnel ──> Offer ──> Hire ──> Team ──> Early Listening ──> Engagement ──> Performance ──> Capability & Mobility ──> Exit ──> Replacement Vacancy
```

### The Dual Entry Architecture:
1. **Vacancy (Pre-Hire)**: Prioritize recruitment demand, diagnose SLA pressure (especially in Bali and commercial roles), optimize source channels, and cultivate recurring frontline talent pipelines.
2. **Team (Post-Hire)**: Monitor retention cohorts (addressing the <12M early-tenure cliff and 1–1.5Y dip), role-level engagement sentiment, and operationalize the **FIT HUB Internal Mobility & Competency Framework** to solve the #1 voluntary departure driver (*Career Development*).

---

## 2. Core Data Architecture

The application is powered by a multi-tier analytical architecture connected to **Supabase PostgreSQL**:

```text
SOURCE  ──>  RAW  ──>  STAGING  ──>  CORE  ──>  MART  ──>  APP
```

- **Observed Case Data**: Historical data from the case study (2,059 hires, 889 exits, 1,636 active survey respondents).
- **Synthetic Future-State Data**: Governed identifiers (`employee_id`, `requisition_id`), recruitment funnels, and performance-capability evidence to illustrate full lifecycle connectivity.
- **Offline-Resilient**: Built-in fallback data fixtures guarantee seamless presentation performance even under intermittent connectivity.

---

## 3. Tech Stack & Design System

- **Framework**: Next.js 14+ (App Router) with React 18 & TypeScript
- **Styling**: Tailwind CSS with custom FIT HUB Design Tokens
  - `brand.teal`: `#23C9D3`
  - `brand.yellow`: `#FFED00`
  - `ink.primary`: `#111111`
  - `surface.soft`: `#F6FAFA`
- **Typography**: **League Spartan** (Headlines & Display) + **Poppins** (UI, Body, Labels)
- **Database**: Supabase PostgreSQL (Project: `folepebumzqcakpaxevq`)
- **Icons**: Lucide React

---

## 4. Getting Started

### Prerequisites
- Node.js v18+ or v20+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/fbudimannn/protopeopleintelligence.git
cd protopeopleintelligence

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the prototype.

---

## 5. Prototype Modules & Features

### 1. Executive Home (`/`)
- Dual primary entry architecture: **Vacancy** (Pre-Hire) and **Team** (Post-Hire).
- 6-step continuous lifecycle loop: `Vacancy -> Hire -> Team -> Develop -> Exit -> Replacement`.
- High-level executive signal strip for frontline hiring pressure, early attrition cliff, and employee voice.
- Reactive global filters for Period, Location, and Role family.

### 2. Vacancy & Sourcing Intelligence (`/vacancy`)
- **Requisition Health & Priority Table**: Live filtering by search query, hiring type (Replacement vs Expansion), and SLA status (Within SLA, At Risk, Breached).
- **Demand & SLA Heatmap (`?tab=matrix`)**: Role x Location matrix highlighting Bali (85.7% replacement share, 34d TTF) and East Java hotspots.
- **Sourcing & Funnel Diagnosis (`?tab=funnel`)**: 5-stage recruitment funnel bottleneck diagnosis and channel effectiveness table proving Employee Referral superiority.
- **Frontline Ready Pool (`?tab=talent-pool`)**: Pre-qualified candidate bank with verified core competencies and one-click interview fast-tracking.
- **Quality & SLA Outcomes (`?tab=outcomes`)**: 4-quarter trajectory measuring SLA breach reduction and new hire 6-month retention.

### 3. Team & Internal Mobility (`/team`)
- **Retention & Lifecycle Cohorts Table**: Role x Location risk matrix analyzing turnover rates, early exit (<12M) rates, and mid-tenure dips.
- **Tenure Survival Curve (`?tab=cliff`)**: 5 milestone tenure bands diagnosing the early onboarding shock (42.7% exits < 6 months) and the 1-1.5Y promotion ceiling.
- **Voice of Employee & eNPS (`?tab=engagement`)**: Net eNPS (+56.6) sentiment analysis, mandatory Survivorship Bias disclosure, and evaluation across 6 core workplace dimensions.
- **Internal Mobility Matcher (`?tab=mobility`)**: Operationalizing frontline skill mapping and candidate scoring from `010_internal_mobility_engine.sql` with promotion simulation.
- **Exit-to-Vacancy Continuity (`?tab=exits`)**: Direct linkage from departure event codes (`EXT-...`) to replacement requisition codes (`REQ-...`).

### 4. Data Readiness & Governance Hub (`/data-readiness`)
- **Interactive 6-Layer Lineage Architecture**: Visual walkthrough of `Source -> Raw -> Staging -> Core -> Mart -> App`.
- **Data Provenance Transparency Registry**: Full audit table distinguishing observed empirical facts from synthetic future-state enablers.
- **3-Horizon Data Maturity Roadmap**: Evolution from descriptive operational spreadsheets to predictive enterprise people intelligence.
- **Workforce Metric Dictionary**: Formal mathematical formulas, SLA thresholds, and operational interpretations for all 7 primary KPIs.

---

## 6. Repository Structure

```text
proto/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # League Spartan + Poppins typography & AppShell
│   ├── globals.css       # Design tokens & Tailwind utilities
│   ├── page.tsx          # Executive Home
│   ├── vacancy/page.tsx  # Vacancy & Sourcing Intelligence Module
│   ├── team/page.tsx     # Team & Internal Mobility Module
│   └── data-readiness/page.tsx # Data Readiness & Governance Hub
├── components/           # Reusable UI Components
│   ├── AppShell.tsx      # Responsive navigation container
│   ├── Sidebar.tsx       # 240px Collapsible sidebar with active route styling
│   ├── TopHeader.tsx     # Global filter bar, provenance badge, & about modal
│   └── DataProvenanceBadge.tsx # Governance provenance disclosure tooltip
├── lib/                  # Shared data access & state context
│   ├── context/FilterContext.tsx # Reactive workforce filter context & Supabase probe
│   ├── data/api.ts       # Unified API layer with auto-fallback to fixtures
│   ├── data/fixtures.ts  # Complete typed datasets & fallback fixtures
│   └── supabaseClient.ts # Resilient Supabase client
├── 010_internal_mobility_engine.sql # PostgreSQL internal mobility scoring engine
├── FIT_HUB_People_Intelligence_PRD_Design_TechSpec_v3.md
├── FIT_HUB_People_Intelligence_Data_Architecture_v4.md
├── FIT_HUB_People_Intelligence_ERD.dbml
├── .env.example          # Safe public environment variable template
├── .gitignore            # Ignored sensitive files (.env.local, node_modules)
└── package.json
```

---

## 7. Author & Attribution

- **Creator**: M. Fakhri Musyaffa Budiman
- **Project**: FIT HUB People Analytics & Intelligence Case Study
- **Deliverable**: Prototype Blueprint & Working Demonstration
