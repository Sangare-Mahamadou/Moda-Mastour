"use client";

import { useEffect, useState } from 'react';

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Robe de Soirée Istanbul", description: "Élégance pure avec détails brodés.", price: 45000, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80", quantity: 15 },
  { id: 2, name: "Abaya Khadija", description: "Minimalisme et confort en soie perlée.", price: 35000, imageUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=500&q=80", quantity: 8 },
  { id: 3, name: "Tunique Ankara Gold", description: "Mélange chic et urbain.", price: 25000, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80", quantity: 20 }
];

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(compressedFile);
          } else {
            reject(new Error('Erreur de compression'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'PRODUITS'>('PRODUITS');

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Produit en édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, quantity: 0, imageUrl: '' });
  const [isEditingUploading, setIsEditingUploading] = useState(false);

  // Nouveau produit
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, quantity: 0, imageUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    
    setOrders([
      { id: 101, customerName: "Awa Koné", phone: "0707123456", total: 45000, method: "Orange Money", status: "PENDING", date: "13/04/2026" },
      { id: 102, customerName: "Kouadio Jean", phone: "0505987654", total: 35000, method: "Wave", status: "COMPLETED", date: "12/04/2026" }
    ]);

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) setProducts(data);
      }
    } catch {
      console.error("Failed to fetch products");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Mastou2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError("");
    } else {
      setError("Mot de passe incorrect.");
    }
  };

  const handleUpdateProduct = async (id: number) => {
    try {
      const p = products.find(prod => prod.id === id);
      const imageUrl = editForm.imageUrl || p?.imageUrl;
      
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm, price: Number(editForm.price), quantity: Number(editForm.quantity), imageUrl })
      });
      if (res.ok) {
        await fetchProducts();
        setEditingId(null);
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Êtes-vous sûre de vouloir supprimer ce produit ?")) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) await fetchProducts();
      } catch (e) {
        alert("Erreur de suppression");
      }
    }
  };

  const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error("Erreur d'upload");
    const data = await res.json();
    return data.imageUrl;
  };

  const handleNewProductFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const compressedFile = await compressImage(e.target.files[0]);
        const url = await uploadFileToServer(compressedFile);
        setNewProduct({ ...newProduct, imageUrl: url });
      } catch(err) {
        alert("Echec de l'upload. L'image est trop volumineuse ou le serveur est indisponible.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEditProductFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsEditingUploading(true);
      try {
        const compressedFile = await compressImage(e.target.files[0]);
        const url = await uploadFileToServer(compressedFile);
        setEditForm({ ...editForm, imageUrl: url });
      } catch(err) {
        alert("Echec de l'upload. L'image est trop volumineuse ou le serveur est indisponible.");
      } finally {
        setIsEditingUploading(false);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) return;
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity),
          imageUrl: newProduct.imageUrl
        })
      });
      if (res.ok) {
        await fetchProducts();
        setNewProduct({ name: '', price: 0, quantity: 0, imageUrl: '' });
      } else {
        alert("Erreur serveur lors de la création.");
      }
    } catch (e) {
      alert("Erreur d'ajout");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '10rem auto', padding: '2rem', background: 'var(--color-white)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Espace Vendeuse</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}/>
          </div>
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Se Connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="page-title" style={{ margin: '0' }}>Tableau de Bord</h1>
        <button className="btn-secondary logout-btn" onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_auth'); }}>Déconnexion</button>
      </div>
      
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('PRODUITS')}
          className={activeTab === 'PRODUITS' ? 'active-tab' : ''}
        >Catalogue</button>
        <button 
          onClick={() => setActiveTab('COMMANDES')}
          className={activeTab === 'COMMANDES' ? 'active-tab' : ''}
        >Commandes Récentes</button>
      </div>

      {activeTab === 'PRODUITS' ? (
        <div className="admin-card">
          <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Gestion des Produits</h2>
          
          <div className="admin-add-form">
            <h3 style={{ marginBottom: '1rem' }}>+ Ajouter un vêtement</h3>
            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-group-flex">
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} required/>
                </div>
                <div className="form-group short-input">
                  <label>Prix (FCFA)</label>
                  <input type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: Number(e.target.value)})} required/>
                </div>
                <div className="form-group short-input">
                  <label>Quantité</label>
                  <input type="number" value={newProduct.quantity} onChange={e=>setNewProduct({...newProduct, quantity: Number(e.target.value)})} required/>
                </div>
              </div>
              <div className="form-group">
                <label>Importer une photo (Depuis PC/Téléphone)</label>
                <input type="file" accept="image/*" onChange={handleNewProductFileSelect} disabled={isUploading}/>
                {isUploading && <span style={{fontSize: '0.8rem', color: 'orange'}}>Chargement en cours...</span>}
                {newProduct.imageUrl && !isUploading && <span style={{fontSize: '0.8rem', color: 'green', fontWeight: 'bold'}}>Image chargée avec succès !</span>}
              </div>
              <button type="submit" className="btn-primary" disabled={isUploading}>Créer le produit</button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom du Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id}>
                    {editingId === p.id ? (
                      <>
                        <td className="edit-cell">
                          <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="Nom du vêtement" className="edit-input" />
                          <div>
                            <small style={{display:'block', marginBottom: '0.3rem'}}>Changer la photo :</small>
                            <input type="file" accept="image/*" onChange={handleEditProductFileSelect} disabled={isEditingUploading}/>
                            {isEditingUploading && <span style={{color: 'orange', fontSize: '0.7rem'}}>Chargement...</span>}
                            {editForm.imageUrl && editForm.imageUrl !== p.imageUrl && <span style={{color: 'green', fontSize: '0.7rem'}}>Nouvelle image reçue</span>}
                          </div>
                        </td>
                        <td className="edit-cell"><input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: Number(e.target.value)})} className="edit-input" /></td>
                        <td className="edit-cell"><input type="number" value={editForm.quantity} onChange={e=>setEditForm({...editForm, quantity: Number(e.target.value)})} className="edit-input" /></td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button onClick={() => handleUpdateProduct(p.id)} className="btn-success" disabled={isEditingUploading}>Sauver</button>
                            <button onClick={() => setEditingId(null)} className="btn-cancel">Annuler</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 'bold' }}>{p.name} {p.imageUrl?.includes('/uploads') ? '📸' : ''}</td>
                        <td style={{ color: 'var(--color-gold)' }}>{p.price.toLocaleString()}</td>
                        <td>{p.quantity}</td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, price: p.price, quantity: p.quantity, imageUrl: '' }); }} className="btn-edit">Modifier</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete">Suppr</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Commandes Récentes</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Contact</th>
                  <th>Moyen</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 'bold' }}>{order.customerName}</td>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{order.total.toLocaleString()} FCFA</td>
                    <td>{order.phone}</td>
                    <td>{order.method}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
