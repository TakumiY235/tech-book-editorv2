import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import CodeHighlighter from "@/components/editor/ui/highlighter/code-highlighter";
import { ToastProvider } from "@/components/ui/toast/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechBook Editor",
  description: "AI-powered technical book writing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <CodeHighlighter />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}