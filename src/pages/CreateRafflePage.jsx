import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, Gift, Coins } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

function ERC1155DropForm() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    collectionAddress: '',
    tokenId: '',
    unitsPerWinner: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    ticketPrice: '',
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
      const duration = parseInt(formData.duration) * 60;
      const ticketPrice = formData.ticketPrice ? ethers.utils.parseEther(formData.ticketPrice) : 0;
      const unitsPerWinner = formData.unitsPerWinner ? parseInt(formData.unitsPerWinner) : 1;
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        false, // isPrized
        ticketPrice,
        false, // erc721Drop (always false for ERC1155)
        formData.collectionAddress,
        1, // standard (ERC1155)
        parseInt(formData.tokenId),
        unitsPerWinner,
        '', '', '',
        address,
        0,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        0,
        0
      );
      if (result.success) {
        alert('ERC1155 Collection raffle created successfully!');
        setFormData({
          name: '',
          collectionAddress: '',
          tokenId: '',
          unitsPerWinner: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          ticketPrice: '',
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
        <Package className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Create ERC1155 Collection Raffle</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Collection Address</label>
            <input
              type="text"
              value={formData.collectionAddress || ''}
              onChange={e => handleChange('collectionAddress', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background font-mono"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Token ID</label>
            <input
              type="number"
              min="0"
              value={formData.tokenId || ''}
              onChange={e => handleChange('tokenId', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Units Per Winner</label>
            <input
              type="number"
              min="1"
              value={formData.unitsPerWinner || ''}
              onChange={e => handleChange('unitsPerWinner', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={e => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-2">Ticket Price (ETH)</label>
          <input
            type="number"
            min="0.00000001"
            step="any"
            value={formData.ticketPrice || ''}
            onChange={e => handleChange('ticketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            required
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}

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
          true, // isPrized
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
          true, // isPrized
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
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
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
            value={formData.customTicketPrice || ''}
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
                  value={formData.collectionName || ''}
                  onChange={(e) => handleChange('collectionName', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Collection Symbol</label>
                <input
                  type="text"
                  value={formData.collectionSymbol || ''}
                  onChange={(e) => handleChange('collectionSymbol', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Base URI</label>
                <input
                  type="url"
                  value={formData.baseURI || ''}
                  onChange={(e) => handleChange('baseURI', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Max Supply</label>
                <input
                  type="number"
                  value={formData.maxSupply || ''}
                  onChange={(e) => handleChange('maxSupply', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Royalty Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.royaltyPercentage || ''}
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
                  value={formData.prizeCollection || ''}
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
                    value={formData.prizeTokenId || ''}
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
                  value={formData.amountPerWinner || ''}
                  onChange={(e) => handleChange('amountPerWinner', e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
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
    maxTicketsPerParticipant: ''
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

      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        false, // isPrized
        0, // customTicketPrice
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
          maxTicketsPerParticipant: ''
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
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={(e) => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const WhitelistRaffleForm = () => {
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

      // All prize params are zero/empty for whitelist raffle
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name, // name
        startTime, // startTime
        duration, // duration
        parseInt(formData.ticketLimit), // ticketLimit
        parseInt(formData.winnersCount), // winnersCount
        parseInt(formData.maxTicketsPerParticipant), // maxTicketsPerParticipant
        false, // isPrized (whitelist raffles are non-prized)
        0, // customTicketPrice (use global ticket price)
        false, // erc721Drop
        ethers.constants.AddressZero, // prizeCollection
        0, // standard
        0, // prizeTokenId
        0, // amountPerWinner
        '', '', '', // collectionName, collectionSymbol, collectionBaseURI
        address, // creator
        0, // royaltyPercentage
        ethers.constants.AddressZero, // royaltyRecipient
        0, // maxSupply
        ethers.constants.AddressZero, // erc20PrizeToken
        0, // erc20PrizeAmount
        0 // ethPrizeAmount
      );

      if (result.success) {
        alert('Whitelist raffle created successfully!');
        setFormData({
          name: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
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
        <h3 className="text-xl font-semibold">Create Whitelist Raffle</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={(e) => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const NewERC721DropForm = () => {
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
    collectionName: '',
    collectionSymbol: '',
    baseURI: '',
    maxSupply: '',
    royaltyPercentage: '',
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
      const customTicketPrice = formData.customTicketPrice ? ethers.utils.parseEther(formData.customTicketPrice) : 0;
      const maxSupply = formData.maxSupply ? parseInt(formData.maxSupply) : parseInt(formData.winnersCount);
      // Multiply by 100 to match contract expectations (e.g., 5% -> 500)
      const royaltyPercentage = formData.royaltyPercentage ? parseInt(formData.royaltyPercentage) * 100 : 0;

      // Defensive: always use AddressZero for prizeCollection
      const prizeCollection = ethers.constants.AddressZero;

      // New ERC721 collection raffle
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        true, // isPrized (NFT drop is prized)
        customTicketPrice,
        false, // erc721Drop (false for new collection deployment)
        prizeCollection, // always AddressZero for new collection
        0, // standard (ERC721)
        0, // prizeTokenId (not used for new collection)
        1, // amountPerWinner (default 1 for ERC721)
        formData.collectionName,
        formData.collectionSymbol,
        formData.baseURI,
        address,
        royaltyPercentage,
        address,
        maxSupply,
        ethers.constants.AddressZero,
        0,
        0
      );

      if (result.success) {
        alert('New ERC721 Collection raffle created successfully!');
        setFormData({
          name: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          customTicketPrice: '',
          collectionName: '',
          collectionSymbol: '',
          baseURI: '',
          maxSupply: '',
          royaltyPercentage: '',
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
        <h3 className="text-xl font-semibold">Create New ERC721 Collection Raffle</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={(e) => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={(e) => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
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
            value={formData.customTicketPrice || ''}
            onChange={(e) => handleChange('customTicketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            placeholder="Leave empty to use protocol default"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 rounded-xl p-4">
          <div>
            <label className="block text-base font-medium mb-2">Collection Name</label>
            <input
              type="text"
              value={formData.collectionName || ''}
              onChange={(e) => handleChange('collectionName', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Collection Symbol</label>
            <input
              type="text"
              value={formData.collectionSymbol || ''}
              onChange={(e) => handleChange('collectionSymbol', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Base URI</label>
            <input
              type="url"
              value={formData.baseURI || ''}
              onChange={(e) => handleChange('baseURI', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Supply</label>
            <input
              type="number"
              value={formData.maxSupply || ''}
              onChange={(e) => handleChange('maxSupply', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Royalty Percentage</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.royaltyPercentage || ''}
              onChange={(e) => handleChange('royaltyPercentage', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              placeholder="0-10%"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
};

function ExistingERC721DropForm() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    collection: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerUser: '',
    ticketPrice: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.collection || !/^0x[a-fA-F0-9]{40}$/.test(formData.collection)) newErrors.collection = 'Invalid address';
    if (!formData.startTime) newErrors.startTime = 'Required';
    if (!formData.duration || formData.duration < 1) newErrors.duration = 'Must be at least 1 minute';
    if (!formData.ticketLimit || formData.ticketLimit < 1) newErrors.ticketLimit = 'Must be at least 1';
    if (!formData.winnersCount || formData.winnersCount < 1) newErrors.winnersCount = 'Must be at least 1';
    if (!formData.maxTicketsPerUser || formData.maxTicketsPerUser < 1) newErrors.maxTicketsPerUser = 'Must be at least 1';
    if (formData.ticketPrice && parseFloat(formData.ticketPrice) < 0.00000001) newErrors.ticketPrice = 'Must be at least 0.00000001 ETH';
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!connected || !contracts.raffleDeployer) {
      alert('Please connect your wallet and ensure contracts are configured');
      return;
    }
    
    setLoading(true);
    try {
      const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const duration = parseInt(formData.duration) * 60;
      const ticketPrice = formData.ticketPrice ? ethers.utils.parseEther(formData.ticketPrice) : 0;
      
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerUser),
        true, // isPrized (existing collection is prized)
        ticketPrice,
        true, // erc721Drop (true for existing collection mintable workflow)
        formData.collection.trim(), // prizeCollection (existing collection address)
        0, // standard (ERC721)
        0, // prizeTokenId (not used for existing collection)
        1, // amountPerWinner (default 1 for ERC721)
        '', '', '', // collection creation params (not used for existing)
        address, // creator
        0, // royaltyPercentage
        ethers.constants.AddressZero, // royaltyRecipient
        0, // maxSupply
        ethers.constants.AddressZero, // erc20PrizeToken
        0, // erc20PrizeAmount
        0 // ethPrizeAmount
      );
      
      if (result.success) {
        alert('Existing ERC721 Collection raffle created successfully!');
        setFormData({
          name: '',
          collection: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerUser: '',
          ticketPrice: '',
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
        <Package className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Create Raffle (Existing ERC721 Prize)</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Collection Address</label>
            <input
              type="text"
              value={formData.collection || ''}
              onChange={e => handleChange('collection', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background font-mono"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              min="1"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              min="1"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per User</label>
            <input
              type="number"
              min="1"
              value={formData.maxTicketsPerUser || ''}
              onChange={e => handleChange('maxTicketsPerUser', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-2">Ticket Price (ETH) <span className="font-normal text-xs text-muted-foreground">(Leave empty for NFT giveaway)</span></label>
          <input
            type="number"
            min="0.00000001"
            step="any"
            value={formData.ticketPrice || ''}
            onChange={e => handleChange('ticketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            required
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            Create Raffle
          </Button>
        </div>
      </form>
    </div>
  );
}

// --- Update FILTERS ---
const FILTERS = {
  raffleType: ['Whitelist/Allowlist', 'NFTDrop', 'Lucky Sale/NFT Giveaway', 'ETH Giveaway', 'ERC20 Token Giveaway'],
  nftStandard: ['ERC721', 'ERC1155'],
  erc721Source: ['New ERC721 Collection', 'Existing ERC721 Collection'], // Removed 'Escrowed ERC721'
  escrowedSource: ['Internal NFT Prize', 'External NFT Prize'],
  luckySaleSource: ['Internal NFT Prize', 'External NFT Prize'],
  erc1155Source: ['Existing ERC1155 Collection', 'Escrowed ERC1155'],
};

const CreateRafflePage = () => {
  const { connected } = useWallet();
  const { contracts } = useContract();
  const [allowExisting721, setAllowExisting721] = useState(null);

  // Filter state
  const [raffleType, setRaffleType] = useState('Whitelist/Allowlist');
  const [nftStandard, setNftStandard] = useState('ERC721');
  const [erc721Source, setErc721Source] = useState('New ERC721 Collection');
  const [erc721EscrowedSource, setErc721EscrowedSource] = useState('Internal NFT Prize');
  const [erc1155EscrowedSource, setErc1155EscrowedSource] = useState('Internal NFT Prize');
  const [luckySaleSource, setLuckySaleSource] = useState('Internal NFT Prize');
  const [erc1155Source, setErc1155Source] = useState('Existing ERC1155 Collection');
  // Track collection address for existing ERC721
  const [existingCollectionAddress, setExistingCollectionAddress] = useState('');

  // Query allowExisting721 if needed
  useEffect(() => {
    const fetchAllowExisting = async () => {
      if (raffleType === 'NFTDrop' && nftStandard === 'ERC721' && erc721Source === 'Existing ERC721 Collection' && contracts.raffleManager) {
        try {
          const allowed = await contracts.raffleManager.toggleAllowExistingCollection();
          setAllowExisting721(!!allowed);
        } catch (e) {
          setAllowExisting721(false);
        }
      }
    };
    fetchAllowExisting();
  }, [raffleType, nftStandard, erc721Source, contracts.raffleManager]);

  // Reset collection address when switching to New ERC721 Collection
  useEffect(() => {
    if (raffleType === 'NFTDrop' && nftStandard === 'ERC721' && erc721Source === 'New ERC721 Collection') {
      setExistingCollectionAddress('');
    }
  }, [raffleType, nftStandard, erc721Source]);

  // --- Dropdown Filter Card UI ---
  const renderFilterCard = () => (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-xl min-h-0">
      {/* Raffle Type */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm whitespace-nowrap">Raffle Type</label>
        <select
          className="px-2 py-1 rounded border bg-background text-foreground text-sm"
          value={raffleType}
          onChange={e => setRaffleType(e.target.value)}
        >
          {FILTERS.raffleType.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      {/* NFTDrop subfilters */}
      {raffleType === 'NFTDrop' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm whitespace-nowrap">NFT Standard</label>
            <select
              className="px-2 py-1 rounded border bg-background text-foreground text-sm"
              value={nftStandard}
              onChange={e => setNftStandard(e.target.value)}
            >
              {FILTERS.nftStandard.map(std => (
                <option key={std} value={std}>{std}</option>
              ))}
            </select>
          </div>
          {nftStandard === 'ERC721' && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm whitespace-nowrap">ERC721 Source</label>
              <select
                className="px-2 py-1 rounded border bg-background text-foreground text-sm"
                value={erc721Source}
                onChange={e => setErc721Source(e.target.value)}
              >
                {FILTERS.erc721Source.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
      {/* Lucky Sale subfilters */}
      {raffleType === 'Lucky Sale/NFT Giveaway' && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm whitespace-nowrap">NFT Standard</label>
          <select
            className="px-2 py-1 rounded border bg-background text-foreground text-sm"
            value={nftStandard}
            onChange={e => setNftStandard(e.target.value)}
          >
            {FILTERS.nftStandard.map(std => (
              <option key={std} value={std}>{std}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // --- Main Form Rendering Logic ---
  const renderForm = () => {
    if (raffleType === 'Whitelist/Allowlist') return <WhitelistRaffleForm />;
    if (raffleType === 'NFTDrop') {
      if (nftStandard === 'ERC721') {
        if (erc721Source === 'New ERC721 Collection') return <NewERC721DropForm />;
        if (erc721Source === 'Existing ERC721 Collection') return <ExistingERC721DropForm collectionAddress={existingCollectionAddress} setCollectionAddress={setExistingCollectionAddress} />;
      }
      if (nftStandard === 'ERC1155') {
        return <ERC1155DropForm />;
      }
    }
    if (raffleType === 'Lucky Sale/NFT Giveaway') {
      if (nftStandard === 'ERC721') return <LuckySaleERC721Form />;
      if (nftStandard === 'ERC1155') return <LuckySaleERC1155Form />;
    }
    if (raffleType === 'ETH Giveaway') return <ETHGiveawayForm />;
    if (raffleType === 'ERC20 Token Giveaway') return <ERC20GiveawayForm />;
    return null;
  };

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
    <div className="min-h-screen bg-background pb-6 pb-16">
      <div className="container mx-auto px-8">
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Create an on-chain raffle for your community
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mt-16">
          <div className="lg:col-span-1">
            {renderFilterCard()}
            {raffleType === 'NFTDrop' && nftStandard === 'ERC1155' && (
              <Link
                to="/deploy-erc1155-collection"
                className="block mt-6 bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 text-base h-12"
              >
                Deploy ERC1155 Collection
              </Link>
            )}
          </div>
          <div className="lg:col-span-3">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add LuckySaleERC721Form
function LuckySaleERC721Form() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    collectionAddress: '',
    tokenId: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    ticketPrice: '',
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
      const duration = parseInt(formData.duration) * 60;
      const ticketPrice = formData.ticketPrice ? ethers.utils.parseEther(formData.ticketPrice) : 0;
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        true, // isPrized (lucky sale is prized)
        ticketPrice,
        false, // erc721Drop (false for escrowed workflow)
        formData.collectionAddress,
        1, // standard (ERC1155)
        parseInt(formData.tokenId),
        unitsPerWinner,
        '', '', '',
        address,
        0,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        0,
        0
      );
      if (result.success) {
        alert('Lucky Sale ERC721 raffle created successfully!');
        setFormData({
          name: '',
          collectionAddress: '',
          tokenId: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          ticketPrice: '',
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
        <h3 className="text-xl font-semibold">Create Lucky Sale (ERC721 Escrowed Prize)</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Collection Address</label>
            <input
              type="text"
              value={formData.collectionAddress || ''}
              onChange={e => handleChange('collectionAddress', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background font-mono"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Token ID</label>
            <input
              type="number"
              min="0"
              value={formData.tokenId || ''}
              onChange={e => handleChange('tokenId', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={e => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-2">Ticket Price (ETH) <span className="font-normal text-xs text-muted-foreground">(Leave empty for NFT giveaway)</span></label>
          <input
            type="number"
            min="0.00000001"
            step="any"
            value={formData.ticketPrice || ''}
            onChange={e => handleChange('ticketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            required
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Add LuckySaleERC1155Form (like ERC1155DropForm but no deploy button)
function LuckySaleERC1155Form() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    collectionAddress: '',
    tokenId: '',
    unitsPerWinner: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: '',
    ticketPrice: '',
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
      const duration = parseInt(formData.duration) * 60;
      const ticketPrice = formData.ticketPrice ? ethers.utils.parseEther(formData.ticketPrice) : 0;
      const unitsPerWinner = formData.unitsPerWinner ? parseInt(formData.unitsPerWinner) : 1;
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        false, // whitelist
        ticketPrice,
        false, // erc1155Drop (always false for existing collections)
        formData.collectionAddress,
        1, // standard (ERC1155)
        parseInt(formData.tokenId),
        unitsPerWinner,
        '', '', '',
        address,
        0,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        0,
        0
      );
      if (result.success) {
        alert('Lucky Sale ERC1155 raffle created successfully!');
        setFormData({
          name: '',
          collectionAddress: '',
          tokenId: '',
          unitsPerWinner: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: '',
          ticketPrice: '',
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
        <h3 className="text-xl font-semibold">Create Lucky Sale (ERC1155 Escrowed Prize)</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Collection Address</label>
            <input
              type="text"
              value={formData.collectionAddress || ''}
              onChange={e => handleChange('collectionAddress', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background font-mono"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Prize Token ID</label>
            <input
              type="number"
              min="0"
              value={formData.tokenId || ''}
              onChange={e => handleChange('tokenId', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Units Per Winner</label>
            <input
              type="number"
              min="1"
              value={formData.unitsPerWinner || ''}
              onChange={e => handleChange('unitsPerWinner', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={e => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-medium mb-2">Ticket Price (ETH) <span className="font-normal text-xs text-muted-foreground">(Leave empty for NFT giveaway)</span></label>
          <input
            type="number"
            min="0.00000001"
            step="any"
            value={formData.ticketPrice || ''}
            onChange={e => handleChange('ticketPrice', e.target.value)}
            className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
            required
          />
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Add ETHGiveawayForm
function ETHGiveawayForm() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ethAmount: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: ''
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
      const duration = parseInt(formData.duration) * 60;
      const ethAmount = formData.ethAmount ? ethers.utils.parseEther(formData.ethAmount) : 0;
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        true, // isPrized (ETH giveaway is prized)
        0, // customTicketPrice (use global ticket price)
        false, // erc721Drop (false for ETH prizes)
        ethers.constants.AddressZero, // prizeCollection
        2, // standard: 2 for ETH
        0, // prizeTokenId
        0, // amountPerWinner
        '', '', '',
        address,
        0,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
        0,
        ethAmount // ETH prize amount
      );
      if (result.success) {
        alert('ETH Giveaway raffle created successfully!');
        setFormData({
          name: '',
          ethAmount: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: ''
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
        <h3 className="text-xl font-semibold">Feeling Generous? Now's a great time to give away some ETH!</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Total ETH Prize</label>
            <input
              type="number"
              min="0.00000001"
              step="any"
              value={formData.ethAmount || ''}
              onChange={e => handleChange('ethAmount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={e => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Add ERC20GiveawayForm
function ERC20GiveawayForm() {
  const { connected, address } = useWallet();
  const { contracts, executeTransaction } = useContract();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tokenAddress: '',
    tokenAmount: '',
    startTime: '',
    duration: '',
    ticketLimit: '',
    winnersCount: '',
    maxTicketsPerParticipant: ''
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
      const duration = parseInt(formData.duration) * 60;
      const tokenAmount = formData.tokenAmount ? ethers.utils.parseUnits(formData.tokenAmount, 18) : 0; // default 18 decimals
      const result = await executeTransaction(
        contracts.raffleDeployer.createRaffle,
        formData.name,
        startTime,
        duration,
        parseInt(formData.ticketLimit),
        parseInt(formData.winnersCount),
        parseInt(formData.maxTicketsPerParticipant),
        true, // isPrized (ERC20 giveaway is prized)
        0, // customTicketPrice (use global ticket price)
        false, // erc721Drop (false for ERC20 prizes)
        formData.tokenAddress, // prizeCollection = ERC20 token address
        3, // standard: 3 for ERC20
        0, // prizeTokenId
        0, // amountPerWinner
        '', '', '',
        address,
        0,
        formData.tokenAddress, // ERC20 token address again for clarity
        tokenAmount, // ERC20 token amount
        ethers.constants.AddressZero,
        0,
        0
      );
      if (result.success) {
        alert('ERC20 Giveaway raffle created successfully!');
        setFormData({
          name: '',
          tokenAddress: '',
          tokenAmount: '',
          startTime: '',
          duration: '',
          ticketLimit: '',
          winnersCount: '',
          maxTicketsPerParticipant: ''
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
        <h3 className="text-xl font-semibold">It's a great day to give out some tokens! 🎁</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium mb-2">Raffle Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">ERC20 Token Address</label>
            <input
              type="text"
              value={formData.tokenAddress || ''}
              onChange={e => handleChange('tokenAddress', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background font-mono"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Total Token Amount</label>
            <input
              type="number"
              min="0.00000001"
              step="any"
              value={formData.tokenAmount || ''}
              onChange={e => handleChange('tokenAmount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime || ''}
              onChange={e => handleChange('startTime', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Ticket Limit</label>
            <input
              type="number"
              value={formData.ticketLimit || ''}
              onChange={e => handleChange('ticketLimit', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Winner Count</label>
            <input
              type="number"
              value={formData.winnersCount || ''}
              onChange={e => handleChange('winnersCount', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-2">Max Tickets Per Participant</label>
            <input
              type="number"
              value={formData.maxTicketsPerParticipant || ''}
              onChange={e => handleChange('maxTicketsPerParticipant', e.target.value)}
              className="w-full px-3 py-2.5 text-base border border-border rounded-lg bg-background"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base h-12"
          >
            {loading ? 'Creating...' : 'Create Raffle'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateRafflePage;