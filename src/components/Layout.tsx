
// Do not modify this file directly. This file is part of the Lovable project template.
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ContactFooter from './ContactFooter';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <ContactFooter />
      <Footer />
    </div>
  );
};

export default Layout;
