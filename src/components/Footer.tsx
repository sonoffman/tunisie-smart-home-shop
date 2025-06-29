
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Smart Home Shop</h3>
            <p className="text-gray-300">
              Votre boutique spécialisée en domotique et maison intelligente en Tunisie.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/" className="hover:text-white">Accueil</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/formation" className="hover:text-white">Formation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/verify-product" className="hover:text-white">
                  <strong>Vérification du numéro de série</strong>
                </Link>
              </li>
              <li>
                <Link to="/formation" className="hover:text-white">
                  <strong>Inscription à une <span className="text-blue-400">formation</span></strong>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-300">
              <p>📧 contact@smarthomeshop.tn</p>
              <p>📞 +216 XX XXX XXX</p>
              <p>📍 Tunis, Tunisie</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Smart Home Shop Tunisie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
