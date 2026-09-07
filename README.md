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
2. **Team (Post-Hire)**: Monitor retention cohorts (addressing the <12M early-tenure cliff and 1–1.5Y dip), role-level engagement sentiment, and operationalize the **Mercer-style Internal Mobility & Capability Framework** to solve the #1 voluntary departure driver (*Career Development*).

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

## 5. Repository Structure

```text
proto/
├── app/                  # Next.js App Router (pages, layouts, globals)
│   ├── layout.tsx        # League Spartan + Poppins fonts & metadata
│   ├── globals.css       # Custom design tokens & base Tailwind styling
│   └── page.tsx          # Homepage with Dual Entry & Lifecycle Ribbon
├── lib/                  # Shared utilities & Supabase client
│   └── supabaseClient.ts # Resilient Supabase client with offline fallback
├── .agents/              # Embedded design & craft skills (impeccable, etc.)
├── 010_internal_mobility_engine.sql # PostgreSQL Internal Mobility Benchmark Engine
├── FIT_HUB_People_Intelligence_PRD_Design_TechSpec_v3.md
├── FIT_HUB_People_Intelligence_Data_Architecture_v4.md
├── FIT_HUB_People_Intelligence_ERD.dbml
├── .env.example          # Safe public environment variable template
├── .gitignore            # Ignored sensitive files (.env.local, node_modules)
└── package.json
```

---

## 6. Author & Attribution

- **Creator**: M. Fakhri Musyaffa Budiman
- **Project**: FIT HUB People Analytics & Intelligence Case Study
- **Deliverable**: Prototype Blueprint & Working Demonstration
