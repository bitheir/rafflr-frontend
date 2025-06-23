import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Layout';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import CreateRafflePage from './pages/CreateRafflePage';
import DeployCollectionPage from './pages/DeployCollectionPage';
import RaffleDetailPage from './pages/RaffleDetailPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import OperatorDashboard from './components/dashboards/OperatorDashboard';
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
              <main className="min-h-[calc(100vh-4rem)]">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/create-raffle" element={<CreateRafflePage />} />
                  <Route path="/deploy-collection" element={<DeployCollectionPage />} />
                  <Route path="/raffle/:raffleAddress" element={<RaffleDetailPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/operator" element={<OperatorDashboard />} />
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


