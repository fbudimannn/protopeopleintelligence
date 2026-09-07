import type { Metadata } from "next";
import { League_Spartan, Poppins } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-spartan",
  weight: ["600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIT HUB People Intelligence | Future-State Decision Prototype",
  description:
    "An executive decision-support prototype connecting Vacancy, Recruitment Funnels, Early-Tenure Retention, Engagement, and Internal Mobility.",
  authors: [{ name: "M. Fakhri Musyaffa Budiman" }],
  icons: {
    icon: "/fithub-logo-square.5b8e5d19f34833be3901.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${poppins.variable}`}>
      <body className="min-h-screen antialiased bg-surface-soft text-ink-primary font-poppins selection:bg-brand-teal selection:text-ink-primary">
        {children}
      </body>
    </html>
  );
}
