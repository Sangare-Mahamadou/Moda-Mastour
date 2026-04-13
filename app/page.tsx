export default function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Turquie ✈️ Babi</span>
          <h1>L'Élégance d'Istanbul, <br/> La Chaleur d'Abidjan.</h1>
          <p>La référence du Luxe de la Mode Turque pour la femme distinguée.<br/>Des tissus premium et des coupes parfaites, directement livrés chez vous.</p>
          <a href="/shop" className="btn-primary">Découvrir le Catalogue</a>
        </div>
      </section>
      
      <section className="features-section">
         <div className="feature">
            <h3>🌟 Qualité Ottomane</h3>
            <p>Le meilleur du textile turc sélectionné méticuleusement pour vous.</p>
         </div>
         <div className="feature">
            <h3>🚚 Livraison Rapide</h3>
            <p>Recevez vos articles chics partout à Abidjan et à l'intérieur du pays.</p>
         </div>
         <div className="feature">
            <h3>💳 Paiement Mobile</h3>
            <p>Orange, Wave, MTN. Simple, rapide et 100% sécurisé.</p>
         </div>
      </section>
    </div>
  )
}
