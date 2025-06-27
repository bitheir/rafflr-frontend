import React, { useState, useEffect } from 'react';
import { User, Ticket, Trophy, DollarSign, Settings, Trash2, Eye, Clock, Users, Gift, RefreshCw, Plus, Minus } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import RoyaltyAdjustmentComponent from '../components/RoyaltyAdjustmentComponent';
import CreatorRevenueWithdrawalComponent from '../components/CreatorRevenueWithdrawalComponent';
import MinterApprovalComponent from '../components/MinterApprovalComponent';
import { CONTRACT_ADDRESSES } from '../constants';
import { Button } from '../components/ui/button';

function mapRaffleState(stateNum) {
  switch (stateNum) {
    case 0: return 'pending';
    case 1: return 'active';
    case 2: return 'drawing';
    case 3: return 'completed';
    case 4: return 'allPrizesClaimed';
    case 5: return 'ended';
    default: return 'unknown';
  }
}

const ActivityCard = ({ activity }) => {
  const navigate = useNavigate();
  
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'ticket_purchase':
        return <Ticket className="h-5 w-5 text-blue-500" />;
      case 'raffle_created':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'raffle_deleted':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'prize_won':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'prize_claimed':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'refund_claimed':
        return <Minus className="h-5 w-5 text-orange-500" />;
      case 'revenue_withdrawn':
        return <DollarSign className="h-5 w-5 text-emerald-500" />;
      case 'admin_withdrawn':
        return <DollarSign className="h-5 w-5 text-indigo-500" />;
      case 'deletion_refund':
        return <Minus className="h-5 w-5 text-orange-500" />;
      case 'full_refund_for_deletion':
        return <Minus className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityDescription = () => {
    switch (activity.type) {
      case 'ticket_purchase':
        return `Purchased ${activity.quantity} ticket(s) for ${activity.raffleName}`;
      case 'raffle_created':
        return `Created raffle "${activity.raffleName}"`;
      case 'raffle_deleted':
        return `Deleted raffle "${activity.raffleName}"`;
      case 'prize_won':
        return `Won prize in "${activity.raffleName}"`;
      case 'prize_claimed':
        return `Claimed prize from "${activity.raffleName}"`;
      case 'refund_claimed':
        return `Claimed refund for "${activity.raffleName}"`;
      case 'revenue_withdrawn':
        return `Withdrew ${ethers.utils.formatEther(activity.amount)} ETH revenue from "${activity.raffleName}"`;
      case 'admin_withdrawn':
        return `Withdrew ${ethers.utils.formatEther(activity.amount)} ETH admin revenue`;
      case 'deletion_refund':
        return `Claimed deletion refund for "${activity.raffleName}"`;
      case 'full_refund_for_deletion':
        return `Claimed full refund for "${activity.raffleName}"`;
      default:
        return activity.description;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getActivityIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{getActivityDescription()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(activity.timestamp * 1000).toLocaleDateString()}
          </p>
          {activity.txHash && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Tx: {activity.txHash.slice(0, 10)}...
            </p>
          )}
        </div>
        {activity.raffleAddress && (
          <button onClick={() => navigate(`/raffle/${activity.raffleAddress}`)} className="fancy h-12 flex items-center justify-center">
            <span className="top-key"></span>
            <span className="text"><Eye className="h-4 w-4" /></span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
      </div>
    </div>
  );
};

const CreatedRaffleCard = ({ raffle, onDelete, onViewRevenue }) => {
  const navigate = useNavigate();
  const { executeTransaction, getContractInstance } = useContract();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    let interval;
    function updateTimer() {
      const now = Math.floor(Date.now() / 1000);
      let targetTime;
      if (raffle.state === 'pending') {
        targetTime = raffle.startTime;
        const remaining = targetTime - now;
      if (remaining > 0) {
          setTimeRemaining(formatTime(remaining));
        } else {
          // If still pending after start time, start counting down to end time
          targetTime = raffle.startTime + raffle.duration;
          const remainingToEnd = targetTime - now;
          if (remainingToEnd > 0) {
            setTimeRemaining(formatTime(remainingToEnd));
      } else {
        setTimeRemaining('Ended');
      }
        }
      } else if (raffle.state === 'active') {
        targetTime = raffle.startTime + raffle.duration;
        const remaining = targetTime - now;
        if (remaining > 0) {
          setTimeRemaining(formatTime(remaining));
        } else {
          setTimeRemaining('Ended');
        }
      } else {
        setTimeRemaining('Ended');
      }
    }
    function formatTime(seconds) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      let formatted = '';
      if (days > 0) formatted += `${days}d `;
      if (hours > 0 || days > 0) formatted += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
      formatted += `${secs}s`;
      return formatted.trim();
    }
    updateTimer();
    interval = setInterval(updateTimer, 1000);
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

  const canDelete = () => {
    // Updated logic: Raffles can now be deleted even after tickets have been sold
    // The contract will handle refunds automatically
    return raffle.state === 'pending' || raffle.state === 'active';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold truncate">{raffle.name}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tickets Sold:</span>
          <span>{raffle.ticketsSold} / {raffle.ticketLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Revenue:</span>
          <span>{ethers.utils.formatEther(raffle.totalRevenue || '0')} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span>{timeRemaining}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => navigate(`/raffle/${raffle.address}`)} className="fancy flex-1 h-12">
          <span className="top-key"></span>
          <span className="text">View</span>
          <span className="bottom-key-1"></span>
          <span className="bottom-key-2"></span>
        </button>
        {raffle.totalRevenue && parseFloat(ethers.utils.formatEther(raffle.totalRevenue)) > 0 && (
          <button onClick={() => onViewRevenue(raffle)} className="fancy h-12">
            <span className="top-key"></span>
            <span className="text">Revenue</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
        {canDelete() && (
          <button onClick={() => onDelete(raffle)} className="fancy h-12" title={raffle.ticketsSold > 0 ? "Delete raffle (refunds will be processed automatically)" : "Delete this raffle"}>
            <span className="top-key"></span>
            <span className="text">Delete</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
        {/* Mint to Winner button for creator */}
        {raffle.isCreator && (
          <button onClick={async () => {
              try {
                const raffleContract = getContractInstance(raffle.address, 'raffle');
                if (!raffleContract) throw new Error('Failed to get raffle contract');
                const result = await executeTransaction(raffleContract.mintToWinner);
                if (result.success) {
                  alert('mintToWinner() executed successfully!');
                  window.location.reload();
                } else {
                  throw new Error(result.error);
                }
              } catch (err) {
                alert('mintToWinner failed: ' + err.message);
              }
            }}
            className="fancy"
            >
            <span className="top-key"></span>
            <span className="text">Mint to winner</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
      </div>
      
      {/* Show deletion info for raffles with sold tickets */}
      {canDelete() && raffle.ticketsSold > 0 && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          <p>ℹ️ Deletion will automatically process refunds for sold tickets</p>
        </div>
      )}
      
      {/* Show info for non-deletable raffles */}
      {!canDelete() && (
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800">
          <p>⚠️ Cannot delete: Raffle is not in pending or active state</p>
        </div>
      )}
    </div>
  );
};

const PurchasedTicketsCard = ({ ticket, onClaimPrize, onClaimRefund }) => {
  const navigate = useNavigate();
  
  const canClaimPrize = () => {
    return ticket.isWinner && (ticket.raffleState === 'Completed' || ticket.raffleState === 'AllPrizesClaimed') && !ticket.prizeClaimed;
  };

  const canClaimRefund = () => {
    return !ticket.isWinner && (ticket.raffleState === 'Completed' || ticket.raffleState === 'AllPrizesClaimed') && !ticket.refundClaimed;
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold truncate">{ticket.raffleName}</h3>
        <span className="text-sm text-muted-foreground">{ticket.quantity} tickets</span>
      </div>
      
      <div className="space-y-1 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Cost:</span>
          <span>{ethers.utils.formatEther(ticket.totalCost)} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Purchase Date:</span>
          <span>{new Date(ticket.purchaseDate * 1000).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">State:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            ticket.raffleState === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            ticket.raffleState === 'active' ? 'bg-green-100 text-green-800' :
            ticket.raffleState === 'drawing' ? 'bg-purple-100 text-purple-800' :
            ticket.raffleState === 'completed' ? 'bg-blue-100 text-blue-800' :
            ticket.raffleState === 'allPrizesClaimed' ? 'bg-blue-100 text-blue-800' :
            ticket.raffleState === 'ended' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {ticket.raffleState.charAt(0).toUpperCase() + ticket.raffleState.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button onClick={() => navigate(`/raffle/${ticket.raffleAddress}`)} className="fancy w-full h-12">
          <span className="top-key"></span>
          <span className="text">Visit raffle page</span>
          <span className="bottom-key-1"></span>
          <span className="bottom-key-2"></span>
        </button>
        
        {canClaimPrize() && (
          <button onClick={() => onClaimPrize(ticket)} className="fancy h-12">
            <span className="top-key"></span>
            <span className="text">Claim prize</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
        
        {canClaimRefund() && (
          <button onClick={() => onClaimRefund(ticket)} className="fancy h-12">
            <span className="top-key"></span>
            <span className="text">Claim refund</span>
            <span className="bottom-key-1"></span>
            <span className="bottom-key-2"></span>
          </button>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { connected, address, provider } = useWallet();
  const { contracts, getContractInstance, executeTransaction, executeCall } = useContract();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('activity');
  const [userActivity, setUserActivity] = useState([]);
  const [createdRaffles, setCreatedRaffles] = useState([]);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [activityStats, setActivityStats] = useState({
    totalTicketsPurchased: 0,
    totalRafflesCreated: 0,
    totalPrizesWon: 0,
    totalRevenueWithdrawn: '0',
    totalRefundsClaimed: 0
  });

  // Fetch on-chain activity
  const fetchOnChainActivity = async () => {
    if (!connected || !address || !provider) return;

    setLoading(true);
    try {
      const activities = [];
      const currentBlock = await provider.getBlockNumber();
      // Increase block range to capture more events
      const fromBlock = Math.max(0, currentBlock - 50000); // Last 50k blocks instead of 10k

      console.log('Fetching activity from block', fromBlock, 'to', currentBlock);

      // 1. Fetch RaffleCreated events from RaffleDeployer
      if (contracts.raffleDeployer) {
        try {
          const raffleCreatedFilter = contracts.raffleDeployer.filters.RaffleCreated(null, address);
          const raffleCreatedEvents = await contracts.raffleDeployer.queryFilter(raffleCreatedFilter, fromBlock);
          
          console.log('Found', raffleCreatedEvents.length, 'RaffleCreated events for address:', address);
          
          // If no events found, try from an even earlier block
          if (raffleCreatedEvents.length === 0) {
            const earlierFromBlock = Math.max(0, currentBlock - 100000); // Last 100k blocks
            console.log('No events found, trying from block', earlierFromBlock);
            const earlierEvents = await contracts.raffleDeployer.queryFilter(raffleCreatedFilter, earlierFromBlock);
            console.log('Found', earlierEvents.length, 'events from earlier block range');
            raffleCreatedEvents.push(...earlierEvents);
          }
          
          for (const event of raffleCreatedEvents) {
            const block = await provider.getBlock(event.blockNumber);
            try {
              // Try to get the actual raffle name
              const raffleContract = getContractInstance(event.args.raffle, 'raffle');
              let raffleName = `Raffle ${event.args.raffle.slice(0, 8)}...`;
              
              if (raffleContract) {
                const nameResult = await executeCall(raffleContract.name);
                if (nameResult.success) {
                  raffleName = nameResult.result;
                }
              }
              
              activities.push({
                type: 'raffle_created',
                raffleAddress: event.args.raffle,
                raffleName: raffleName,
                timestamp: block.timestamp,
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
              });
            } catch (error) {
              console.error('Error processing RaffleCreated event:', error);
              // Still add the activity with fallback name
              activities.push({
                type: 'raffle_created',
                raffleAddress: event.args.raffle,
                raffleName: `Raffle ${event.args.raffle.slice(0, 8)}...`,
                timestamp: block.timestamp,
                txHash: event.transactionHash,
                blockNumber: event.blockNumber
              });
            }
          }
        } catch (error) {
          console.error('Error fetching RaffleCreated events:', error);
        }
      }

      // 2. Fetch TicketsPurchased events from all raffles
      if (contracts.raffleManager) {
        try {
          // Get all registered raffles
          const raffleRegisteredFilter = contracts.raffleManager.filters.RaffleRegistered();
          const raffleRegisteredEvents = await contracts.raffleManager.queryFilter(raffleRegisteredFilter, fromBlock);
          
          console.log('Found', raffleRegisteredEvents.length, 'registered raffles');
          
          for (const event of raffleRegisteredEvents) {
            const raffleAddress = event.args.raffle;
            const raffleContract = getContractInstance(raffleAddress, 'raffle');
            
            if (raffleContract) {
              try {
                // Fetch ticket purchases for this raffle
                const ticketsPurchasedFilter = raffleContract.filters.TicketsPurchased(address);
                const ticketEvents = await raffleContract.queryFilter(ticketsPurchasedFilter, fromBlock);
                
                for (const ticketEvent of ticketEvents) {
                  const block = await provider.getBlock(ticketEvent.blockNumber);
                  try {
                    const [
                      name,
                      ticketPrice,
                      stateNum,
                      isWinner,
                      prizeClaimed,
                      refundClaimed,
                      prizeCollection,
                      isPrizedContract
                    ] = await Promise.all([
                      executeCall(raffleContract.name),
                      executeCall(raffleContract.ticketPrice),
                      executeCall(raffleContract.state),
                      executeCall(raffleContract.isWinner, address),
                      executeCall(raffleContract.prizeClaimed, address),
                      executeCall(raffleContract.refundClaimed, address),
                      executeCall(raffleContract.prizeCollection),
                      executeCall(raffleContract.isPrized)
                    ]);

                    const isPrized = !!isPrizedContract.success && isPrizedContract.result;
                    let mappedState = stateNum.success ? mapRaffleState(stateNum.result) : 'unknown';
                    if (!isPrized && mappedState === 'allPrizesClaimed') {
                      mappedState = 'completed';
                    }

                    const quantity = ticketEvent.args.quantity.toNumber();
                    const totalCost = ticketPrice.success ? 
                      ticketPrice.result.mul(quantity) : 
                      ethers.BigNumber.from(0);

                    activities.push({
                      type: 'ticket_purchase',
                      raffleAddress: raffleAddress,
                      raffleName: name.result,
                      quantity: quantity,
                      totalCost: totalCost,
                      purchaseDate: (await provider.getBlock(ticketEvent.blockNumber)).timestamp,
                      isWinner: isWinner.success ? isWinner.result : false,
                      raffleState: mappedState,
                      prizeClaimed: prizeClaimed.success ? prizeClaimed.result : false,
                      refundClaimed: refundClaimed.success ? refundClaimed.result : false,
                      isPrized
                    });
                  } catch (error) {
                    console.error('Error fetching ticket details:', error);
                  }
                }

                // Fetch prize claims for this raffle
                const prizeClaimedFilter = raffleContract.filters.PrizeClaimed(address);
                const prizeEvents = await raffleContract.queryFilter(prizeClaimedFilter, fromBlock);
                
                for (const prizeEvent of prizeEvents) {
                  const block = await provider.getBlock(prizeEvent.blockNumber);
                  try {
                    const raffleInfo = await executeCall(raffleContract.name);
                    activities.push({
                      type: 'prize_claimed',
                      raffleAddress: raffleAddress,
                      raffleName: raffleInfo.success ? raffleInfo.result : `Raffle ${raffleAddress.slice(0, 8)}...`,
                      tokenId: prizeEvent.args.tokenId.toString(),
                      timestamp: block.timestamp,
                      txHash: prizeEvent.transactionHash,
                      blockNumber: prizeEvent.blockNumber
                    });
                  } catch (error) {
                    console.error('Error fetching raffle name for prize:', error);
                  }
                }

                // Fetch revenue withdrawals for this raffle
                const revenueWithdrawnFilter = raffleContract.filters.RevenueWithdrawn(address);
                const revenueEvents = await raffleContract.queryFilter(revenueWithdrawnFilter, fromBlock);
                
                for (const revenueEvent of revenueEvents) {
                  const block = await provider.getBlock(revenueEvent.blockNumber);
                  try {
                    const raffleInfo = await executeCall(raffleContract.name);
                    activities.push({
                      type: 'revenue_withdrawn',
                      raffleAddress: raffleAddress,
                      raffleName: raffleInfo.success ? raffleInfo.result : `Raffle ${raffleAddress.slice(0, 8)}...`,
                      amount: revenueEvent.args.amount,
                      timestamp: block.timestamp,
                      txHash: revenueEvent.transactionHash,
                      blockNumber: revenueEvent.blockNumber
                    });
                  } catch (error) {
                    console.error('Error fetching raffle name for revenue:', error);
                  }
                }

                // Fetch raffle deletions
                const raffleDeletedFilter = raffleContract.filters.RaffleDeleted();
                const deletedEvents = await raffleContract.queryFilter(raffleDeletedFilter, fromBlock);
                
                for (const deletedEvent of deletedEvents) {
                  const block = await provider.getBlock(deletedEvent.blockNumber);
                  try {
                    const raffleInfo = await executeCall(raffleContract.name);
                    activities.push({
                      type: 'raffle_deleted',
                      raffleAddress: raffleAddress,
                      raffleName: raffleInfo.success ? raffleInfo.result : `Raffle ${raffleAddress.slice(0, 8)}...`,
                      timestamp: block.timestamp,
                      txHash: deletedEvent.transactionHash,
                      blockNumber: deletedEvent.blockNumber
                    });
                  } catch (error) {
                    console.error('Error fetching raffle name for deletion:', error);
                  }
                }

                // Fetch deletion refunds
                const deletionRefundFilter = raffleContract.filters.DeletionRefund(address);
                const deletionRefundEvents = await raffleContract.queryFilter(deletionRefundFilter, fromBlock);
                
                for (const refundEvent of deletionRefundEvents) {
                  const block = await provider.getBlock(refundEvent.blockNumber);
                  try {
                    const raffleInfo = await executeCall(raffleContract.name);
                    activities.push({
                      type: 'deletion_refund',
                      raffleAddress: raffleAddress,
                      raffleName: raffleInfo.success ? raffleInfo.result : `Raffle ${raffleAddress.slice(0, 8)}...`,
                      amount: refundEvent.args.amount,
                      timestamp: block.timestamp,
                      txHash: refundEvent.transactionHash,
                      blockNumber: refundEvent.blockNumber
                    });
                  } catch (error) {
                    console.error('Error fetching raffle name for deletion refund:', error);
                  }
                }

                // Fetch full refunds for deletion
                const fullRefundForDeletionFilter = raffleContract.filters.FullRefundForDeletion(address);
                const fullRefundEvents = await raffleContract.queryFilter(fullRefundForDeletionFilter, fromBlock);
                
                for (const refundEvent of fullRefundEvents) {
                  const block = await provider.getBlock(refundEvent.blockNumber);
                  try {
                    const raffleInfo = await executeCall(raffleContract.name);
                    activities.push({
                      type: 'full_refund_for_deletion',
                      raffleAddress: raffleAddress,
                      raffleName: raffleInfo.success ? raffleInfo.result : `Raffle ${raffleAddress.slice(0, 8)}...`,
                      amount: refundEvent.args.amount,
                      timestamp: block.timestamp,
                      txHash: refundEvent.transactionHash,
                      blockNumber: refundEvent.blockNumber
                    });
                  } catch (error) {
                    console.error('Error fetching raffle name for full refund:', error);
                  }
                }
              } catch (error) {
                console.error('Error processing raffle events:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching raffle manager events:', error);
        }
      }

      // 3. Fetch AdminWithdrawn events from RevenueManager
      if (contracts.revenueManager) {
        try {
          const adminWithdrawnFilter = contracts.revenueManager.filters.AdminWithdrawn(address);
          const adminWithdrawnEvents = await contracts.revenueManager.queryFilter(adminWithdrawnFilter, fromBlock);
          
          for (const event of adminWithdrawnEvents) {
            const block = await provider.getBlock(event.blockNumber);
            activities.push({
              type: 'admin_withdrawn',
              amount: event.args.amount,
              timestamp: block.timestamp,
              txHash: event.transactionHash,
              blockNumber: event.blockNumber
            });
          }
        } catch (error) {
          console.error('Error fetching AdminWithdrawn events:', error);
        }
      }

      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setUserActivity(activities);

      console.log('Total activities found:', activities.length);
      console.log('Activity breakdown:', {
        raffle_created: activities.filter(a => a.type === 'raffle_created').length,
        ticket_purchase: activities.filter(a => a.type === 'ticket_purchase').length,
        prize_claimed: activities.filter(a => a.type === 'prize_claimed').length,
        revenue_withdrawn: activities.filter(a => a.type === 'revenue_withdrawn').length,
        raffle_deleted: activities.filter(a => a.type === 'raffle_deleted').length,
        admin_withdrawn: activities.filter(a => a.type === 'admin_withdrawn').length,
        deletion_refund: activities.filter(a => a.type === 'deletion_refund').length,
        full_refund_for_deletion: activities.filter(a => a.type === 'full_refund_for_deletion').length
      });

      // Calculate activity stats
      const stats = {
        totalTicketsPurchased: activities.filter(a => a.type === 'ticket_purchase').length,
        totalRafflesCreated: activities.filter(a => a.type === 'raffle_created').length,
        totalPrizesWon: activities.filter(a => a.type === 'prize_claimed').length,
        totalRevenueWithdrawn: activities
          .filter(a => a.type === 'revenue_withdrawn' || a.type === 'admin_withdrawn')
          .reduce((sum, a) => sum.add(a.amount), ethers.BigNumber.from(0))
          .toString(),
        totalRefundsClaimed: 0 // No refund events in contract, will be tracked via UI state
      };
      setActivityStats(stats);

    } catch (error) {
      console.error('Error fetching on-chain activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch created raffles
  const fetchCreatedRaffles = async () => {
    if (!connected || !address || !contracts.raffleManager) return;

    try {
      const raffles = [];
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000); // Use same extended range

      console.log('Fetching created raffles from block', fromBlock, 'to', currentBlock);

      // Get all RaffleCreated events for this user
      const raffleCreatedFilter = contracts.raffleDeployer.filters.RaffleCreated(null, address);
      const raffleCreatedEvents = await contracts.raffleDeployer.queryFilter(raffleCreatedFilter, fromBlock);

      console.log('Found', raffleCreatedEvents.length, 'RaffleCreated events for user:', address);

      // If no events found, try from an even earlier block
      if (raffleCreatedEvents.length === 0) {
        const earlierFromBlock = Math.max(0, currentBlock - 100000); // Last 100k blocks
        console.log('No raffles found, trying from block', earlierFromBlock);
        const earlierEvents = await contracts.raffleDeployer.queryFilter(raffleCreatedFilter, earlierFromBlock);
        console.log('Found', earlierEvents.length, 'raffles from earlier block range');
        raffleCreatedEvents.push(...earlierEvents);
      }

      for (const event of raffleCreatedEvents) {
        const raffleAddress = event.args.raffle;
        console.log('Processing raffle:', raffleAddress);
        
        const raffleContract = getContractInstance(raffleAddress, 'raffle');
        
        if (raffleContract) {
          try {
            const [name, startTime, duration, ticketLimit, ticketsSold, state, totalRevenue] = await Promise.all([
              executeCall(raffleContract.name),
              executeCall(raffleContract.startTime),
              executeCall(raffleContract.duration),
              executeCall(raffleContract.ticketLimit),
              executeCall(raffleContract.ticketsSold),
              executeCall(raffleContract.state),
              executeCall(raffleContract.totalRevenue)
            ]);

            if (name.success) {
              const raffleData = {
                id: raffleAddress,
                name: name.result,
                address: raffleAddress,
                startTime: startTime.success ? startTime.result.toNumber() : 0,
                duration: duration.success ? duration.result.toNumber() : 0,
                ticketLimit: ticketLimit.success ? ticketLimit.result.toNumber() : 0,
                ticketsSold: ticketsSold.success ? ticketsSold.result.toNumber() : 0,
                totalRevenue: totalRevenue.success ? totalRevenue.result : ethers.BigNumber.from(0),
                state: state.success ? mapRaffleState(state.result) : 'unknown'
              };
              
              console.log('Successfully fetched raffle data:', raffleData);
              raffles.push(raffleData);
            } else {
              console.error('Failed to fetch raffle name for:', raffleAddress);
            }
          } catch (error) {
            console.error('Error fetching raffle details for', raffleAddress, ':', error);
          }
        } else {
          console.error('Failed to create contract instance for raffle:', raffleAddress);
        }
      }

      console.log('Total created raffles found:', raffles.length);
      setCreatedRaffles(raffles);
    } catch (error) {
      console.error('Error fetching created raffles:', error);
    }
  };

  // Fetch purchased tickets
  const fetchPurchasedTickets = async () => {
    if (!connected || !address || !contracts.raffleManager) return;

    try {
      const tickets = [];
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      // Get all registered raffles
      const raffleRegisteredFilter = contracts.raffleManager.filters.RaffleRegistered();
      const raffleRegisteredEvents = await contracts.raffleManager.queryFilter(raffleRegisteredFilter, fromBlock);

      for (const event of raffleRegisteredEvents) {
        const raffleAddress = event.args.raffle;
        const raffleContract = getContractInstance(raffleAddress, 'raffle');
        
        if (raffleContract) {
          // Get ticket purchases for this user
          const ticketsPurchasedFilter = raffleContract.filters.TicketsPurchased(address);
          const ticketEvents = await raffleContract.queryFilter(ticketsPurchasedFilter, fromBlock);

          for (const ticketEvent of ticketEvents) {
            try {
              const [
                name,
                ticketPrice,
                stateNum,
                isWinner,
                prizeClaimed,
                refundClaimed,
                prizeCollection,
                isPrizedContract
              ] = await Promise.all([
                executeCall(raffleContract.name),
                executeCall(raffleContract.ticketPrice),
                executeCall(raffleContract.state),
                executeCall(raffleContract.isWinner, address),
                executeCall(raffleContract.prizeClaimed, address),
                executeCall(raffleContract.refundClaimed, address),
                executeCall(raffleContract.prizeCollection),
                executeCall(raffleContract.isPrized)
              ]);

              const isPrized = !!isPrizedContract.success && isPrizedContract.result;
              let mappedState = stateNum.success ? mapRaffleState(stateNum.result) : 'unknown';
              if (!isPrized && mappedState === 'allPrizesClaimed') {
                mappedState = 'completed';
              }

              if (name.success) {
                const quantity = ticketEvent.args.quantity.toNumber();
                const totalCost = ticketPrice.success ? 
                  ticketPrice.result.mul(quantity) : 
                  ethers.BigNumber.from(0);

                tickets.push({
                  id: `${raffleAddress}-${ticketEvent.transactionHash}`,
                  raffleName: name.result,
                  raffleAddress: raffleAddress,
                  quantity: quantity,
                  totalCost: totalCost,
                  purchaseDate: (await provider.getBlock(ticketEvent.blockNumber)).timestamp,
                  isWinner: isWinner.success ? isWinner.result : false,
                  raffleState: mappedState,
                  prizeClaimed: prizeClaimed.success ? prizeClaimed.result : false,
                  refundClaimed: refundClaimed.success ? refundClaimed.result : false,
                  isPrized
                });
              }
            } catch (error) {
              console.error('Error fetching ticket details:', error);
            }
          }
        }
      }

      setPurchasedTickets(tickets);
    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
    }
  };

  // Load data when wallet connects
  useEffect(() => {
    if (connected && address) {
      fetchOnChainActivity();
      fetchCreatedRaffles();
      fetchPurchasedTickets();
    }
  }, [connected, address, contracts]);

  // Refresh all data
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchOnChainActivity(),
      fetchCreatedRaffles(),
      fetchPurchasedTickets()
    ]);
    setLoading(false);
  };

  const handleDeleteRaffle = async (raffle) => {
    let confirmMessage = `Are you sure you want to delete "${raffle.name}"?`;
    
    if (raffle.ticketsSold > 0) {
      confirmMessage += `\n\nThis raffle has ${raffle.ticketsSold} sold tickets. Deletion will automatically process refunds for all participants.`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const raffleContract = getContractInstance(raffle.address, 'raffle');
      if (!raffleContract) {
        throw new Error('Failed to get raffle contract');
      }

      const result = await executeTransaction(raffleContract.deleteRaffle);
      
      if (result.success) {
        const successMessage = raffle.ticketsSold > 0 
          ? `Raffle deleted successfully! Refunds have been processed automatically for ${raffle.ticketsSold} sold tickets.`
          : 'Raffle deleted successfully!';
        alert(successMessage);
        // Refresh data after deletion
        handleRefresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Error deleting raffle: ' + error.message);
    }
  };

  const handleViewRevenue = (raffle) => {
    setSelectedRaffle(raffle);
    setShowRevenueModal(true);
  };

  const handleClaimPrize = async (ticket) => {
    try {
      const raffleContract = getContractInstance(ticket.raffleAddress, 'raffle');
      if (!raffleContract) {
        throw new Error('Failed to get raffle contract');
      }

      let result;
      if (ticket.prizeAmount > 1) {
        // Multiple prizes - use claimPrizes
        result = await executeTransaction(raffleContract.claimPrizes, ticket.prizeAmount);
      } else {
        // Single prize - use claimPrize
        result = await executeTransaction(raffleContract.claimPrize);
      }
      
      if (result.success) {
        alert('Prize claimed successfully!');
        // Refresh data after claiming
        handleRefresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Error claiming prize: ' + error.message);
    }
  };

  const handleClaimRefund = async (ticket) => {
    try {
      const raffleContract = getContractInstance(ticket.raffleAddress, 'raffle');
      if (!raffleContract) {
        throw new Error('Failed to get raffle contract');
      }

      const result = await executeTransaction(raffleContract.claimRefund);
      
      if (result.success) {
        alert('Refund claimed successfully!');
        // Refresh data after claiming
        handleRefresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error claiming refund:', error);
      alert('Error claiming refund: ' + error.message);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your profile and activity.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'created', label: 'Created Raffles', icon: Users },
    { id: 'tickets', label: 'Purchased Tickets', icon: Ticket },
    { id: 'collections', label: 'Creator Dashboard', icon: Settings }
  ];

  return (
    <div className="mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10 pb-16">
      <div className="mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile</h1>
              <p className="text-muted-foreground">
                Track activities, manage your raffles, revenue and collections
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Connected Account:</p>
            <p className="font-mono text-sm">{address}</p>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{activityStats.totalTicketsPurchased}</p>
                  <p className="text-sm text-muted-foreground">Tickets Purchased</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Plus className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activityStats.totalRafflesCreated}</p>
                  <p className="text-sm text-muted-foreground">Raffles Created</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{activityStats.totalPrizesWon}</p>
                  <p className="text-sm text-muted-foreground">Prizes Won</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{parseFloat(ethers.utils.formatEther(activityStats.totalRevenueWithdrawn)).toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">ETH Withdrawn</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Minus className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{activityStats.totalRefundsClaimed}</p>
                  <p className="text-sm text-muted-foreground">Refunds Claimed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'activity' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">
                    Showing last 50,000 blocks of activity
                  </p>
                </div>
                {userActivity.length > 0 ? (
                  <div className="space-y-4">
                    {userActivity.map((activity, index) => (
                      <ActivityCard key={`${activity.txHash}-${activity.blockNumber}-${index}`} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activity found in the last 50,000 blocks</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Try participating in raffles or creating your own to see activity here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'created' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Created Raffles</h2>
                </div>
                {createdRaffles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {createdRaffles.map((raffle) => (
                      <CreatedRaffleCard
                        key={raffle.id}
                        raffle={raffle}
                        onDelete={handleDeleteRaffle}
                        onViewRevenue={handleViewRevenue}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't created any raffles yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Purchased Tickets</h2>
                {purchasedTickets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchasedTickets.map((ticket) => (
                      <PurchasedTicketsCard
                        key={ticket.id}
                        ticket={ticket}
                        onClaimPrize={handleClaimPrize}
                        onClaimRefund={handleClaimRefund}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">You haven't purchased any tickets yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Visit the landing page to participate in active raffles
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Creator Dashboard</h2>
                  <p className="text-muted-foreground mb-6">
                    Manage your NFT collections, adjust royalties, withdraw revenue, and control minter approvals.
                  </p>
                </div>
                
                <RoyaltyAdjustmentComponent />
                <CreatorRevenueWithdrawalComponent />
                <MinterApprovalComponent />
              </div>
            )}
          </div>
        )}

        {/* Revenue Modal */}
        {showRevenueModal && selectedRaffle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Revenue Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Raffle:</span>
                  <span className="font-medium">{selectedRaffle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">{ethers.utils.formatEther(selectedRaffle.totalRevenue)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets Sold:</span>
                  <span className="font-medium">{selectedRaffle.ticketsSold}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRevenueModal(false)} className="fancy flex-1 h-12">
                  <span className="top-key"></span>
                  <span className="text">Close</span>
                  <span className="bottom-key-1"></span>
                  <span className="bottom-key-2"></span>
                </button>
                <button onClick={() => { setShowRevenueModal(false); }} className="fancy flex-1 h-12">
                  <span className="top-key"></span>
                  <span className="text">Withdraw</span>
                  <span className="bottom-key-1"></span>
                  <span className="bottom-key-2"></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

