import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ANH EM TUI - Hệ thống Quản lý Gia phả Thông minh",
  description: "Giải pháp số hóa gia phả chuyên nghiệp, giúp kết nối các thế hệ và bảo tồn cội nguồn dòng họ với công nghệ bảo mật hiện đại.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { LanguageHandler } from "@/components/common/LanguageHandler";
import { ToastContainer } from "@/components/common/ToastContainer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageHandler />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
