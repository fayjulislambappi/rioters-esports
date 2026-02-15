import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";
import Preloader from "@/components/ui/Preloader";

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

    const iconUrl = settingsObj.faviconUrl || "/logo.png";

    return {
      title: settingsObj.siteName || "Rioters Esports | The Ultimate Competitive Gaming Platform",
      description: "Join the revolution of competitive gaming. Tournaments, teams, and community.",
      icons: {
        icon: [
          { url: iconUrl, sizes: "32x32", type: "image/png" },
          { url: iconUrl, sizes: "192x192", type: "image/png" },
          { url: iconUrl, sizes: "512x512", type: "image/png" },
        ],
        apple: [
          { url: iconUrl, sizes: "180x180", type: "image/png" },
        ],
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

  let logoUrl = "/logo.png";
  let siteName = "RIOTERS ESPORTS";
  try {
    await connectDB();
    const settings = await Setting.find({ key: { $in: ["logoUrl", "siteName"] } });
    const siteSetting = settings.find(s => s.key === "siteName");
    const logoSetting = settings.find(s => s.key === "logoUrl");
    if (siteSetting) siteName = siteSetting.value;
    if (logoSetting) logoUrl = logoSetting.value;
  } catch (error) {
    console.error("Failed to fetch branding for layout:", error);
  }

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
          <Preloader logoUrl={logoUrl} />
          <ConditionalLayout initialBranding={{ siteName, logoUrl }}>
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
