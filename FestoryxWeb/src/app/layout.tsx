import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: "500",
});

import { getSiteSettings } from "@/actions/settings.actions";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { ServerWakeup } from "@/components/shared/server-wakeup";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = "/Logo.gif";
  try {
    const settings = await getSiteSettings();
    if (settings?.faviconUrl) {
      favicon = settings.faviconUrl;
    }
  } catch (error) {
    console.error("Error loading site settings for favicon:", error);
  }

  return {
    title: "Festoryx - Multi-Tenant Event Management SaaS & Competition OS",
    description: "Festoryx is a multi-tenant event operating system and interactive competition suite.",
    verification: {
      google: "-tLV5LGzklIMBfcWQzZMSEMgq4uT35lAkcimmIBuXtw",
    },
    keywords: [
      "Festoryx",
      "hackathon",
      "community events",
      "quiz",
      "competition manager",
    ],
    openGraph: {
      title: "Festoryx - Multi-Tenant Event Management SaaS & Competition OS",
      description: "Festoryx is a multi-tenant event operating system and interactive competition suite.",
      url: "/",
      siteName: "Festoryx",
      type: "website",
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://festoryx-socket.onrender.com";

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#9382ff",
          colorBackground: "#060317",
          colorInputBackground: "#030014",
          colorInputText: "#f4f0ff",
          colorText: "#f4f0ff",
          colorTextSecondary: "#a8a6b7",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          card: "border border-white/5 bg-[#060317]/90 backdrop-blur-md",
          headerTitle: "text-white font-heading",
          headerSubtitle: "text-gray-400",
          socialButtonsIconButton: "border border-white/10 text-white bg-white/5 hover:bg-white/10",
          formButtonPrimary: "bg-[#9382ff] hover:bg-[#816eff] text-white shadow-md active:scale-95 transition-all duration-200",
          footerActionText: "text-gray-400",
          footerActionLink: "text-[#9382ff] hover:text-[#816eff]",
        }
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${dmSans.variable} dark`}
        data-scroll-behavior="smooth"
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__SOCKET_URL__ = ${JSON.stringify(socketUrl)};`,
            }}
          />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <ServerWakeup />
          <LoadingScreen />
          {children}

          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
          />

          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-7LNPV0D7NN"
            strategy="afterInteractive"
          />

          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-7LNPV0D7NN');
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
