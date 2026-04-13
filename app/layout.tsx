import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from './context/CartContext'

export const metadata: Metadata = {
  title: 'Moda Mastou - Vêtements de Luxe pour Femmes',
  description: 'Boutique en ligne élégante de vêtements féminins. Mode de Turquie en Côte d\'Ivoire.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <header className="main-header">
          <a href="/" className="logo-link">
            <img src="/mastou3.png" alt="Moda Mastou Logo" className="logo-img" />
          </a>
          <nav className="main-nav">
            <a href="/">Accueil</a>
            <a href="/shop">Catalogue</a>
            <a href="/cart">Panier</a>
          </nav>
        </header>
        <CartProvider>
          <main>{children}</main>
        </CartProvider>
        <footer className="main-footer">
          <p>&copy; 2026 Moda Mastou. Tous droits réservés.</p>
        </footer>
      </body>
    </html>
  )
}
