import React from 'react';
import Header from '../components/layout/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <footer className="py-8 border-t border-slate-100 text-center text-xs text-slate-400 dark:border-slate-800 bg-white dark:bg-slate-900">
        &copy; {new Date().getFullYear()} StyleAI. All rights reserved. Portfolio E-commerce Platform.
      </footer>
    </div>
  );
};

export default MainLayout;
