import type { Metadata } from 'next';
import './globals.css';
 
export const metadata: Metadata = {
  title: 'Trios – Find Your Match',
  description: 'A Tinder-style matching app',
};
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
 