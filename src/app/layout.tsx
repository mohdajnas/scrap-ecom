import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patshell Trading | The Premier Scrap E-Commerce Platform",
  description: "Buy and sell scrap materials easily with Patshell Trading. Your one-stop sustainable marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-ink bg-surface">
        <NextTopLoader color="#E63946" showSpinner={false} />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
