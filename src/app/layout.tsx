import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Setting.find({});
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return {
      title: settingsObj.siteName || "Rioters Esports | The Ultimate Competitive Gaming Platform",
      description: "Join the revolution of competitive gaming. Tournaments, teams, and community.",
      icons: {
        icon: settingsObj.faviconUrl || "/favicon.ico",
      }
    };
  } catch (error) {
    console.error("Metadata generation failed:", error);
    return {
      title: "Rioters Esports | The Ultimate Competitive Gaming Platform",
      description: "Join the revolution of competitive gaming. Tournaments, teams, and community.",
    };
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          orbitron.variable,
        )}
      >
        <Providers session={session}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,46,46,0.2)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
