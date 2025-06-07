
import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/components/AppProviders';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'SUJUD - Your Personal Namaz Companion',
  description: 'Track your daily prayers, get inspired, and find guidance with SUJUD.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppProviders>
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
