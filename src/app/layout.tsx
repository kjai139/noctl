import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppSidebar from "@/components/sidebar/appSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MMTL | Modern AI translator",
  description: "Modern machine translator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AppSidebar></AppSidebar>
        {children}
        </Providers>
      </body>
    </html>
  );
}
