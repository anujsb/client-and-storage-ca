import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { DM_Sans } from "next/font/google"


const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
})

export const metadata: Metadata = {
  title: "CA FileTrack",
  description: "Multi-tenant CA firm management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
