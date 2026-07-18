import type { Metadata } from "next";
import localFont from 'next/font/local';
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

const myriadPro = localFont({
  src: [
    {
      path: './fonts/myriad-pro/MyriadPro-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/myriad-pro/MYRIADPRO-REGULAR.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/myriad-pro/MYRIADPRO-SEMIBOLD.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/myriad-pro/MYRIADPRO-SEMIBOLDIT.otf',
      weight: '600',
      style: 'italic',
    },
    {
      path: './fonts/myriad-pro/MYRIADPRO-BOLD.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/myriad-pro/MYRIADPRO-BOLDIT.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-myriad-pro',
});

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
      <body className={`${myriadPro.variable} font-sans antialiased text-ink bg-surface`}>
        <NextTopLoader color="#E63946" showSpinner={false} />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
