import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { FontSizeProvider } from '@/components/providers/FontSizeProvider';
import { UsageProvider } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Amkyaw AI Power Platform',
  description: 'AI-powered chat platform using Gemini and Neon Database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'min-h-screen bg-zinc-950 antialiased')}>
        <ThemeProvider>
          <FontSizeProvider>
            <UsageProvider>
              {children}
            </UsageProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}