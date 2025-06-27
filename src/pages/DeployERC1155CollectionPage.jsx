import React, { useState } from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const DeployERC1155CollectionPage = () => {
  const { connected } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    baseURI: '',
    maxSupply: '',
    royaltyPercentage: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !contracts.nftFactory) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }

    setLoading(true);
    try {
      const result = await executeTransaction(
        contracts.nftFactory.deployERC1155Collection,
        formData.name,
        formData.symbol,
        formData.baseURI,
        parseInt(formData.maxSupply),
        parseInt(formData.royaltyPercentage || '0')
      );

      if (result.success) {
        alert('ERC1155 collection deployed successfully!');
        // Reset form
        setFormData({
          name: '',
          symbol: '',
          baseURI: '',
          maxSupply: '',
          royaltyPercentage: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deploying collection:', error);
      alert('Error deploying collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to deploy collections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Deploy ERC1155 Prize Collection</h1>
          <p className="text-muted-foreground text-lg">Create a new ERC1155 collection for raffle prizes</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Package className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Collection Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium mb-2">Collection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="My Prize Collection"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Collection Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => handleChange('symbol', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="MPC"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Base URI</label>
                <input
                  type="url"
                  value={formData.baseURI}
                  onChange={(e) => handleChange('baseURI', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="https://api.example.com/metadata/"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Max Supply</label>
                <input
                  type="number"
                  value={formData.maxSupply}
                  onChange={(e) => handleChange('maxSupply', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="1000"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-base font-medium mb-2">Royalty Percentage (0-10%)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.royaltyPercentage}
                  onChange={(e) => handleChange('royaltyPercentage', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                to="/create-raffle"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 text-base h-12"
              >
                <ArrowLeft className="h-5 w-5" />
                Create Raffle
              </Link>
              
              <Button
                type="submit"
                disabled={loading || !connected}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12 flex-1"
              >
                {loading ? 'Deploying...' : 'Deploy Collection'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeployERC1155CollectionPage;