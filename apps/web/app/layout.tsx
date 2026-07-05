import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/common/Header/Header";
import { Footer } from "@/components/common/Footer/Footer";
import { SITE_URL } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const DEFAULT_DESCRIPTION =
  "Browse the Prósi product catalog — apparel, accessories, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prósi — Product Catalog",
    template: "%s · Prósi",
  },
  description: DEFAULT_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Prósi",
    type: "website",
    locale: "en_US",
    title: "Prósi — Product Catalog",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "Prósi — Product Catalog",
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
