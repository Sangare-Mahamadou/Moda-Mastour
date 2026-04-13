"use client";

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Determine product catalog source
    let sourceProducts = [];
    const localData = localStorage.getItem('moda-mastou-products');
    
    if (localData) {
      sourceProducts = JSON.parse(localData);
    } else {
      sourceProducts = [
        { id: 1, name: "Robe de Soirée Istanbul", description: "Élégance pure avec détails brodés. Une exclusivité Moda Mastou pour vos grands événements.", price: 45000, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" },
        { id: 2, name: "Abaya Khadija", description: "Minimalisme et confort en soie perlée. Idéal pour une tenue distinguée et modeste.", price: 35000, imageUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&q=80" },
        { id: 3, name: "Ensemble Tunique Gold", description: "Un mélange de style chic et urbain. Parfait pour les événements spéciaux et les réunions élégantes.", price: 25000, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" }
      ];
    }
    
    setTimeout(() => {
      const found = sourceProducts.find((p: any) => p.id === parseInt(params.id));
      setProduct(found || sourceProducts[0]);
      setLoading(false);
    }, 300);
  }, [params.id]);

  if (loading) return <div className="loading-state">Chargement du produit...</div>;

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    alert("Produit ajouté au panier avec succès !");
  };

  return (
    <div className="product-details-container">
      <div className="product-details-grid">
        <div className="product-image-large" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
        <div className="product-info-large">
          <h1>{product.name}</h1>
          <p className="price-large">{product.price.toLocaleString()} FCFA</p>
          <p className="description">{product.description}</p>
          
          <div className="actions">
            <button onClick={handleAdd} className="btn-primary">Ajouter au Panier</button>
            <button onClick={() => router.push('/cart')} className="btn-secondary" style={{ marginLeft: '1rem' }}>Voir le Panier</button>
          </div>
        </div>
      </div>
    </div>
  );
}
