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
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: "500",
});

import { LoadingScreen } from "@/components/shared/loading-screen";
import { ServerWakeup } from "@/components/shared/server-wakeup";

export async function generateMetadata(): Promise<Metadata> {
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
      icon: "/LogoGIF.gif",
      shortcut: "/LogoGIF.gif",
      apple: "/LogoGIF.gif",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
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
