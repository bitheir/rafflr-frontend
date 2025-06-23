import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, Calendar, Gift, Coins } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

const PrizedRaffleForm = () => {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    customTicketPrice: '',
    prizeSource: 'new',
    prizeCollection: '',
    prizeType: 'erc721',
    prizeTokenId: '',
    amountPerWinner: '1',
    useMintableWorkflow: false,
    isEscrowed: false,
    // New collection fields
    collectionName: '',
    collectionSymbol: '',
    baseURI: '',
    maxSupply: '',
    royaltyPercentage: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !contracts.raffleDeployer) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }

    setLoading(true);
    try {
      const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const duration = parseInt(formData.duration) * 60; // Convert minutes to seconds
      const customTicketPrice = formData.customTicketPrice ? 
        ethers.utils.parseEther(formData.customTicketPrice) : 0;

      let result;

      if (formData.prizeSource === 'new') {
        // Create raffle with new collection
        result = await executeTransaction(
          contracts.raffleDeployer.createRaffle,
          formData.name,
          startTime,
          duration,
          parseInt(formData.ticketLimit),
          parseInt(formData.winnersCount),
          parseInt(formData.maxTicketsPerParticipant),
          true, // hasPrize
          customTicketPrice,
          false, // useMintableWorkflow
          ethers.constants.AddressZero, // prizeCollection
          0, // standard (ERC721)
          0, // prizeTokenId
          1, // amountPerWinner
          formData.collectionName,
          formData.collectionSymbol,
          formData.baseURI,
          address, // creator
          parseInt(formData.royaltyPercentage || '0'),
          ethers.constants.AddressZero, // royaltyRecipient (will be set by contract)
          parseInt(formData.maxSupply || formData.winnersCount)
        );
      } else {
        // Create raffle with existing collection
        const standard = formData.prizeType === 'erc721' ? 0 : 1;
        
        result = await executeTransaction(
          contracts.raffleDeployer.createRaffle,
          formData.name,
          startTime,
          duration,
          parseInt(formData.ticketLimit),
          parseInt(formData.winnersCount),
          parseInt(formData.maxTicketsPerParticipant),
          true, // hasPrize
          customTicketPrice,
          formData.useMintableWorkflow,
          formData.prizeCollection,
          standard,
          formData.useMintableWorkflow ? 0 : parseInt(formData.prizeTokenId),
          parseInt(formData.amountPerWinner),
          '', '', '', // collection creation params (not used for existing)
          address, // creator
          0,
          ethers.constants.AddressZero,
          0
        );
      }

      if (result.success) {
        alert('Prized raffle created successfully!');
        // Reset form
        setFormData({
          name: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          customTicketPrice: '',
          prizeSource: 'new',
          prizeCollection: '',
          prizeType: 'erc721',
          prizeTokenId: '',
          amountPerWinner: '1',
          useMintableWorkflow: false,
          isEscrowed: false,
          collectionName: '',
          collectionSymbol: '',
          baseURI: '',
          maxSupply: '',
          royaltyPercentage: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      alert('Error creating raffle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Gift className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Create Prized Raffle</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Winners Count</label>
            <input
              type="number"
              value={formData.winnersCount}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant}
              onChange={(e) => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>

        {/* Custom Ticket Price */}
        <div>
          <label className="block text-base font-medium mb-2">Custom Ticket Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={formData.customTicketPrice}
            onChange={(e) => handleChange('customTicketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            placeholder="Leave empty to use protocol default"
          />
        </div>

        {/* Prize Configuration */}
        <div className="space-y-4">
          <h4 className="font-semibold text-base">Prize Configuration</h4>
          
          <div>
            <label className="block text-base font-medium mb-3">Prize Source</label>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-base">
                <input
                  type="radio"
                  name="prizeSource"
                  value="new"
                  checked={formData.prizeSource === 'new'}
                  onChange={(e) => handleChange('prizeSource', e.target.value)}
                  className="w-4 h-4"
                />
                <span>Create New Collection</span>
              </label>
              <label className="flex items-center gap-2 text-base">
                <input
                  type="radio"
                  name="prizeSource"
                  value="existing"
                  checked={formData.prizeSource === 'existing'}
                  onChange={(e) => handleChange('prizeSource', e.target.value)}
                  className="w-4 h-4"
                />
                <span>Use Existing Collection</span>
              </label>
            </div>
          </div>

          {formData.prizeSource === 'new' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl">
              <div>
                <label className="block text-base font-medium mb-2">Collection Name</label>
                <input
                  type="text"
                  value={formData.collectionName}
                  onChange={(e) => handleChange('collectionName', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Collection Symbol</label>
                <input
                  type="text"
                  value={formData.collectionSymbol}
                  onChange={(e) => handleChange('collectionSymbol', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
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
                  placeholder="Defaults to winners count"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Royalty Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.royaltyPercentage}
                  onChange={(e) => handleChange('royaltyPercentage', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="0-10%"
                />
              </div>
            </div>
          )}

          {formData.prizeSource === 'existing' && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-xl">
              <div>
                <label className="block text-base font-medium mb-2">Prize Collection Address</label>
                <input
                  type="text"
                  value={formData.prizeCollection}
                  onChange={(e) => handleChange('prizeCollection', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-3">Prize Type</label>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 text-base">
                    <input
                      type="radio"
                      name="prizeType"
                      value="erc721"
                      checked={formData.prizeType === 'erc721'}
                      onChange={(e) => handleChange('prizeType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>ERC721</span>
                  </label>
                  <label className="flex items-center gap-2 text-base">
                    <input
                      type="radio"
                      name="prizeType"
                      value="erc1155"
                      checked={formData.prizeType === 'erc1155'}
                      onChange={(e) => handleChange('prizeType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>ERC1155</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useMintableWorkflow"
                  checked={formData.useMintableWorkflow}
                  onChange={(e) => handleChange('useMintableWorkflow', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useMintableWorkflow" className="text-base font-medium">
                  Use Mintable Workflow
                </label>
              </div>

              {!formData.useMintableWorkflow && (
                <div>
                  <label className="block text-base font-medium mb-2">Token ID</label>
                  <input
                    type="number"
                    value={formData.prizeTokenId}
                    onChange={(e) => handleChange('prizeTokenId', e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-base font-medium mb-2">Amount Per Winner</label>
                <input
                  type="number"
                  value={formData.amountPerWinner}
                  onChange={(e) => handleChange('amountPerWinner', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {loading ? 'Creating...' : 'Create Prized Raffle'}
          </button>
          
          <Link
            to="/deploy-collection"
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 text-base"
          >
            Deploy ERC1155 Collection
          </Link>
        </div>
      </form>
    </div>
  );
};

const NonPrizedRaffleForm = () => {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    customTicketPrice: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !contracts.raffleDeployer) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }

    setLoading(true);
    try {
      const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const duration = parseInt(formData.duration) * 60; // Convert minutes to seconds
      const customTicketPrice = formData.customTicketPrice ? 
        ethers.utils.parseEther(formData.customTicketPrice) : 0;

      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        false, // hasPrize
        customTicketPrice,
        false, // useMintableWorkflow
        ethers.constants.AddressZero, // prizeCollection
        0, // standard
        0, // prizeTokenId
        0, // amountPerWinner
        '', '', '', // collection creation params
        address, // creator
        0,
        ethers.constants.AddressZero,
        0
      );

      if (result.success) {
        alert('Non-prized raffle created successfully!');
        // Reset form
        setFormData({
          name: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          customTicketPrice: ''
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      alert('Error creating raffle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Coins className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Create Non-Prized Raffle</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Winners Count</label>
            <input
              type="number"
              value={formData.winnersCount}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant}
              onChange={(e) => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-base font-medium mb-2">Custom Ticket Price (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={formData.customTicketPrice}
            onChange={(e) => handleChange('customTicketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            placeholder="Leave empty to use protocol default"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {loading ? 'Creating...' : 'Create Non-Prized Raffle'}
          </button>
          
          <Link
            to="/deploy-collection"
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 text-base"
          >
            Deploy ERC1155 Collection
          </Link>
        </div>
      </form>
    </div>
  );
};

const CreateRafflePage = () => {
  const { connected } = useWallet();
  const { contracts } = useContract();
  const [prizedRafflesEnabled, setPrizedRafflesEnabled] = useState(null);

  useEffect(() => {
    const checkPrizedRaffles = async () => {
      if (contracts.raffleManager) {
        try {
          const enabled = await contracts.raffleManager.prizedRafflesEnabled();
          setPrizedRafflesEnabled(enabled);
        } catch (error) {
          console.error('Error checking prized raffles status:', error);
          setPrizedRafflesEnabled(false);
        }
      }
    };

    checkPrizedRaffles();
  }, [contracts.raffleManager]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to create raffles and deploy collections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Create Raffle</h1>
          <p className="text-muted-foreground text-lg">Create exciting raffles for your community</p>
        </div>

        {prizedRafflesEnabled !== null && (
          prizedRafflesEnabled ? <PrizedRaffleForm /> : <NonPrizedRaffleForm />
        )}
      </div>
    </div>
  );
};

export default CreateRafflePage;