import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recruitment App",
  description: "Advanced Recruitment Platform based on Nex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.className} h-full text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
