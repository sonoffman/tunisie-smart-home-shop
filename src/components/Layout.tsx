
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
