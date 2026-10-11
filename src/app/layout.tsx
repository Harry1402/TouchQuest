import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TouchQuest — Screen-Free Nature Missions",
  description:
    "Step away from your screen. Generate mindful, practical outdoor nature quests powered by Gemma AI with a phone-down audio-guided experience.",
  keywords: [
    "nature quest",
    "touch grass",
    "digital detox",
    "mindfulness",
    "Gemma AI",
    "outdoor exploration",
  ],
  authors: [{ name: "TouchQuest Team" }],
  openGraph: {
    title: "TouchQuest — Screen-Free Nature Missions",
    description: "Generate mindful, practical outdoor quests. Disconnect and touch grass.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#244836",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FBF9F4] text-[#1C2720]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
