// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chat with PDF',
  description: 'Chat with your PDF documents using AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-black text-white min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
