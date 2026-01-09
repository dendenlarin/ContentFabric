import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Content Fabric',
  description: 'Generative content pipeline admin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-background text-foreground min-h-screen antialiased">{children}</body>
    </html>
  );
}
