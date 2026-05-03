import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import CartSidebar from '@/components/CartSidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Jacob store - Mobile Phones & Accessories',
  description: 'Your one-stop shop for mobile phones, phone accessories, and vapes.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-brand-light text-brand-dark antialiased" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartSidebar />
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
