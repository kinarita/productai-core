import type { Metadata } from "next";
import { ProductAILiveEffects } from "@/components/ProductAILiveEffects";
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
  return (
    <html lang="en">
      <body>
        <ProductAILiveEffects />
        {children}
      </body>
    </html>
  );
}
