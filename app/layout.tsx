import type { Metadata } from "next";
import { ProductAILiveEffects } from "@/components/ProductAILiveEffects";
import { ProductAIReadHydration } from "@/components/ProductAIReadHydration";
import { bootstrapDatabase } from "@/lib/server/db/bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProductAI — AI Product Organization OS",
  description: "Mission control for AI-native product organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window === "undefined") {
    bootstrapDatabase();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ProductAILiveEffects />
        <ProductAIReadHydration />
        {children}
      </body>
    </html>
  );
}
