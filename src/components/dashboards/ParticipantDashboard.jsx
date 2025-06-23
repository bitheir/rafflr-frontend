import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Trophy, Users } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import { ethers } from 'ethers';

const RaffleCard = ({ raffle, onPurchaseTickets, onClaimPrize, onClaimRefund }) => {
  const { address } = useWallet();
  const [userTickets, setUserTickets] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Update time remaining every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = raffle.startTime + raffle.duration;
      const remaining = endTime - now;
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Ended');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [raffle]);

  const getStatusBadge = () => {
    // Use the actual contract state instead of time-based logic
    switch (raffle.state) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
      case 'drawing':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Drawing</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Completed</span>;
      case 'ended':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Ended</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  const canPurchaseTickets = () => {
    // Can only purchase tickets if raffle is active
    return raffle.state === 'active';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{raffle.name}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Creator:</span>
          <span className="font-mono">{raffle.creator?.slice(0, 10)}...</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ticket Price:</span>
          <span>{ethers.utils.formatEther(raffle.ticketPrice || '0')} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tickets Sold:</span>
          <span>{raffle.ticketsSold || 0} / {raffle.ticketLimit}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Winners:</span>
          <span>{raffle.winnersCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time Remaining:</span>
          <span>{timeRemaining}</span>
        </div>
        {raffle.hasPrize && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prize Collection:</span>
            <span className="font-mono">{raffle.prizeCollection?.slice(0, 10)}...</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Your Tickets:</span>
          <span>{userTickets}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {canPurchaseTickets() && (
          <button
            onClick={() => onPurchaseTickets(raffle)}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Buy Tickets
          </button>
        )}
        
        {raffle.state === 'completed' && raffle.hasPrize && (
          <button
            onClick={() => onClaimPrize(raffle)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Claim Prize
          </button>
        )}
        
        {raffle.state === 'cancelled' && userTickets > 0 && (
          <button
            onClick={() => onClaimRefund(raffle)}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            Claim Refund
          </button>
        )}
      </div>
    </div>
  );
};

const TicketPurchaseModal = ({ isOpen, onClose, raffle, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await onConfirm(raffle, quantity);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !raffle) return null;

  const totalCost = ethers.utils.formatEther(
    ethers.BigNumber.from(raffle.ticketPrice || '0').mul(quantity)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 mx-4">
        <h2 className="text-xl font-semibold mb-4">Purchase Tickets</h2>
        <p className="text-muted-foreground mb-4">Raffle: {raffle.name}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              max={raffle.maxTicketsPerParticipant}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span>Price per ticket:</span>
              <span>{ethers.utils.formatEther(raffle.ticketPrice || '0')} ETH</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total cost:</span>
              <span>{totalCost} ETH</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantDashboard = () => {
  const { connected } = useWallet();
  const { contracts, getContractInstance, executeTransaction } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (connected) {
      // In a real implementation, you would fetch raffles from the contract
      setRaffles([
        {
          id: '1',
          name: 'NFT Art Raffle',
          creator: '0x1234567890123456789012345678901234567890',
          startTime: Math.floor(Date.now() / 1000) - 3600, // Started 1 hour ago
          duration: 86400, // 24 hours
          ticketPrice: ethers.utils.parseEther('0.01'),
          ticketLimit: 100,
          ticketsSold: 45,
          winnersCount: 3,
          maxTicketsPerParticipant: 5,
          hasPrize: true,
          prizeCollection: '0x9876543210987654321098765432109876543210',
          state: 'active'
        },
        {
          id: '2',
          name: 'Community Raffle',
          creator: '0x1111111111111111111111111111111111111111',
          startTime: Math.floor(Date.now() / 1000) + 3600, // Starts in 1 hour
          duration: 43200, // 12 hours
          ticketPrice: ethers.utils.parseEther('0.005'),
          ticketLimit: 200,
          ticketsSold: 0,
          winnersCount: 5,
          maxTicketsPerParticipant: 10,
          hasPrize: false,
          state: 'pending'
        }
      ]);
    }
  }, [connected]);

  const handlePurchaseTickets = (raffle) => {
    setSelectedRaffle(raffle);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async (raffle, quantity) => {
    if (!contracts.raffleManager) {
      throw new Error('Contract not initialized');
    }

    // Get raffle contract instance
    const raffleContract = getContractInstance(raffle.address, 'raffle');
    if (!raffleContract) {
      throw new Error('Failed to get raffle contract');
    }

    const totalCost = ethers.BigNumber.from(raffle.ticketPrice).mul(quantity);
    
    const result = await executeTransaction(
      raffleContract.purchaseTickets,
      quantity,
      { value: totalCost }
    );

    if (result.success) {
      alert(`Successfully purchased ${quantity} tickets!`);
      // Refresh raffles data
    } else {
      throw new Error(result.error);
    }
  };

  const handleClaimPrize = async (raffle) => {
    if (!contracts.raffleManager) {
      alert('Contract not initialized');
      return;
    }

    const raffleContract = getContractInstance(raffle.address, 'raffle');
    if (!raffleContract) {
      alert('Failed to get raffle contract');
      return;
    }

    const result = await executeTransaction(raffleContract.claimPrize);
    
    if (result.success) {
      alert('Prize claimed successfully!');
    } else {
      alert('Failed to claim prize: ' + result.error);
    }
  };

  const handleClaimRefund = async (raffle) => {
    if (!contracts.raffleManager) {
      alert('Contract not initialized');
      return;
    }

    const raffleContract = getContractInstance(raffle.address, 'raffle');
    if (!raffleContract) {
      alert('Failed to get raffle contract');
      return;
    }

    const result = await executeTransaction(raffleContract.claimRefund);
    
    if (result.success) {
      alert('Refund claimed successfully!');
    } else {
      alert('Failed to claim refund: ' + result.error);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view and participate in raffles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Participant Dashboard</h1>
        <p className="text-muted-foreground">
          Discover and participate in exciting raffles
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Raffles
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading raffles...</p>
          </div>
        ) : raffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                onPurchaseTickets={handlePurchaseTickets}
                onClaimPrize={handleClaimPrize}
                onClaimRefund={handleClaimRefund}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Raffles</h3>
            <p className="text-muted-foreground">
              There are currently no active raffles. Check back later!
            </p>
          </div>
        )}
      </div>

      <TicketPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        raffle={selectedRaffle}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default ParticipantDashboard;

