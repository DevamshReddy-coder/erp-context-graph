import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ERP Context Graph',
  description: 'AI-Powered Context Graph for ERP Automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
