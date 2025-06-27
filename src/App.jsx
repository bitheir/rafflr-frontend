import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Layout';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import CreateRafflePage from './pages/CreateRafflePage';
import DeployERC1155CollectionPage from './pages/DeployERC1155CollectionPage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import OperatorDashboard from './components/dashboards/OperatorDashboard';
import WhitelistRafflePage from './pages/WhitelistRafflePage';
import NFTPrizedRafflePage from './pages/NFTPrizedRafflePage';
import TokenGiveawayRafflePage from './pages/TokenGiveawayRafflePage';
import './App.css';

function App() {
  // Set dark theme as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider>
      <WalletProvider>
        <ContractProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Header />
              <div style={{ height: '80px' }} />
              <main className="min-h-[calc(100vh-4rem)]">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/create-raffle" element={<CreateRafflePage />} />
                  <Route path="/deploy-erc1155-collection" element={<DeployERC1155CollectionPage />} />
                  <Route path="/raffle/:raffleAddress" element={<RaffleDetailPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/operator" element={<OperatorDashboard />} />
                  <Route path="/whitelist-raffles" element={<WhitelistRafflePage />} />
                  <Route path="/nft-prized-raffles" element={<NFTPrizedRafflePage />} />
                  <Route path="/token-giveaway-raffles" element={<TokenGiveawayRafflePage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ContractProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;


