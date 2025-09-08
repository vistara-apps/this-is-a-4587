import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import DepositModal from './components/DepositModal';
import { AppProvider } from './context/AppContext';

function App() {
  const { isConnected } = useAccount();
  const [showDepositModal, setShowDepositModal] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header />
        
        <main className="relative">
          {!isConnected ? (
            <Hero />
          ) : (
            <Dashboard onDeposit={() => setShowDepositModal(true)} />
          )}
        </main>

        {showDepositModal && (
          <DepositModal onClose={() => setShowDepositModal(false)} />
        )}

        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;