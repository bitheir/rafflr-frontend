import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Wallet, ChevronDown, User, Plus } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import WalletModal from './wallet/WalletModal';
import { Link } from 'react-router-dom';

const Header = () => {
  const { connected, address, formatAddress, disconnect } = useWallet();
  const { isDark, toggleTheme } = useTheme();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="Raffle Protocol Logo" className="h-8 w-8" style={{ backgroundColor: 'transparent' }} />
                <span className="text-xl font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>Raffle Protocol</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {connected ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    {formatAddress(address)}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-40">
                      <Link 
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link 
                        to="/create-raffle"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Plus className="h-4 w-4" />
                        Create Raffle
                      </Link>
                      <button
                        onClick={() => { disconnect(); setShowDropdown(false); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                      >
                        <Wallet className="h-4 w-4" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
};

export { Header };


