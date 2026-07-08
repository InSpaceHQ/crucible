import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "~/components/providers/convex-client-provider";
import { FlagsmithProvider } from "~/components/providers/flagsmith-provider";
import { QueryProvider } from "~/components/providers/query-provider";
import { Header } from "./header";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InSpace Crucible Port-Harcourt",
  description:
    "Port-Harcourt's most interactive gaming competition. Compete as a team of 4 for the price money of NGN 600,000. Compete with 2 players each for Mortal Kombat and Football Club 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ClerkProvider>
          <FlagsmithProvider>
            <QueryProvider>
              <ConvexClientProvider>
                <Header />
                {children}
                <Toaster
                  theme="light"
                  style={{ "--toast-radius": "0" } as React.CSSProperties}
                  toastOptions={{
                    className: "border font-mono text-sm",
                    style: {
                      background: "var(--background)",
                      color: "var(--foreground)",
                      borderColor: "var(--border)",
                      borderRadius: 0,
                    },
                  }}
                />
              </ConvexClientProvider>
            </QueryProvider>
          </FlagsmithProvider>
        </ClerkProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
      </body>
    </html>
  );
}
