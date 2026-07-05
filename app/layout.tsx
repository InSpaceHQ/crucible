import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "~/components/providers/convex-client-provider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InSpace Crucible",
  description: "Port-Harcourt most interactive gaming competition",
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
        <ConvexClientProvider>
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
      </body>
    </html>
  );
}
