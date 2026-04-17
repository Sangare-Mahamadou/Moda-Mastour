"use client";

import { useState } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';

// Note: Metadata is not supported in client components.
// You might need to move this to a server component if you need metadata.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="fr">
      <body>
        <header className="main-header">
          <a href="/" className="logo-link">
            <img src="/mastou3.png" alt="Moda Mastou Logo" className="logo-img" />
          </a>
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            &#9776;
          </button>
          <nav className={`main-nav ${isMenuOpen ? 'is-open' : ''}`}>
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
