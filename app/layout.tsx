import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {CANONICAL_ORIGIN,SEO_INDEXABLE,SITE_ORIGIN,canonicalUrl,jsonLd,siteUrl} from "./seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "つなぐ開発｜業務システム・DX開発",
  description:
    "問い合わせ、予約、顧客管理、案件管理、集計のシステム化から、API連携、既存システム改善、Web・集客改善まで対応します。",
  alternates: { canonical: canonicalUrl("/") },
  robots: { index: SEO_INDEXABLE, follow: SEO_INDEXABLE },
  openGraph: {
    title: "つなぐ開発｜業務システム・DX開発",
    description: "手作業を、仕組みに変える。業務システム、API連携、Web改善の設計・開発。",
    url: CANONICAL_ORIGIN,
    siteName: "つなぐ開発",
    locale: "ja_JP",
    type: "website",
    images: [{ url: siteUrl("/og.png?v=3"), width: 1200, height: 630, alt: "つなぐ開発｜つなぎ、かたちにする。" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "つなぐ開発｜業務システム・DX開発",
    description: "手作業を、仕組みに変える。業務システム、API連携、Web改善の設計・開発。",
    images: [siteUrl("/og.png?v=3")],
  },
  manifest: "/site.webmanifest?v=3",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=3", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [{ url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {"@type":"WebSite",name:"つなぐ開発",url:CANONICAL_ORIGIN,inLanguage:"ja-JP"},
    {"@type": "ProfessionalService",name: "つなぐ開発",url: CANONICAL_ORIGIN,description: "問い合わせ、予約、顧客管理、案件管理、集計のシステム化、API連携、Web改善の設計・開発支援。",areaServed: "JP",image:siteUrl("/og.png?v=3"),knowsAbout: ["業務DX","システムインテグレーション","Webアプリケーション開発","技術SEO","アクセス解析","業務自動化"]},
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#F7F5F1" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=3" color="#4A4E3B" />
        <meta name="msapplication-TileColor" content="#F7F5F1" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png?v=3" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
