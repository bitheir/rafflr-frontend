import React from 'react';
import { Wallet, X } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

const WalletModal = ({ isOpen, onClose }) => {
  const { connectWallet, loading } = useWallet();

  const handleConnect = async (walletType) => {
    try {
      await connectWallet(walletType);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => handleConnect('metamask')}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">MetaMask</div>
              <div className="text-sm text-muted-foreground">Connect using browser wallet</div>
            </div>
          </button>
          
          <button
            onClick={() => handleConnect('walletconnect')}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">WalletConnect</div>
              <div className="text-sm text-muted-foreground">Scan with mobile wallet</div>
            </div>
          </button>
          
          <button
            onClick={() => handleConnect('coinbase')}
            disabled={loading}
            className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Coinbase Wallet</div>
              <div className="text-sm text-muted-foreground">Connect using Coinbase</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;

