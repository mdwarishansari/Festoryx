import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { ServerWakeup } from "@/components/shared/server-wakeup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Festoryx Quiz Arena — Live Real-Time Interactive Competition Suite",
  description: "Festoryx Quiz Arena is the live real-time interactive quiz operating system for communities, community hubs, community colleges, and community hackathons.",
  icons: {
    icon: "/Logo.gif",
    shortcut: "/Logo.gif",
    apple: "/Logo.gif",
  },
};

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
        className={`${inter.variable} ${spaceGrotesk.variable} dark`}
        suppressHydrationWarning
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__SOCKET_URL__ = ${JSON.stringify(socketUrl)};`,
            }}
          />
        </head>
        <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/30">
          <ServerWakeup />
          <LoadingScreen />
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
