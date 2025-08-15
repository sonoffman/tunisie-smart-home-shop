
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileCategoryBar from './MobileCategoryBar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MobileCategoryBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
