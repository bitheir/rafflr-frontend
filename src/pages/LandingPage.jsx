import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Button } from '../components/ui/button';
import { PageContainer } from '../components/Layout';

const RaffleCard = ({ raffle }) => {
  const navigate = useNavigate();
  const [timeLabel, setTimeLabel] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    let interval;
    function updateTimer() {
      const now = Math.floor(Date.now() / 1000);
      let label = '';
      let seconds = 0;
      if (now < raffle.startTime) {
        label = 'Starts In';
        seconds = raffle.startTime - now;
      } else {
        label = 'Ends In';
        seconds = (raffle.startTime + raffle.duration) - now;
      }
      setTimeLabel(label);
      setTimeRemaining(seconds > 0 ? formatTime(seconds) : 'Ended');
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

  const handleViewRaffle = () => {
    navigate(`/raffle/${raffle.address}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold truncate flex-1 mr-2">{raffle.name}</h3>
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
          <span className="text-muted-foreground">{timeLabel}:</span>
          <span>{timeRemaining}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            raffle.isPrized 
              ? (raffle.prizeCollection ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800')
              : 'bg-gray-100 text-gray-800'
          }`}>
            {
              !raffle.isPrized ? 'Whitelist' :
              (raffle.prizeCollection ? 'NFT-Prized' : 'Token Giveaway')
            }
          </span>
        </div>
        {raffle.isPrized && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prize Collection:</span>
            <span className="font-mono">{raffle.prizeCollection?.slice(0, 10)}...</span>
          </div>
        )}
      </div>
      
      <Button
        onClick={handleViewRaffle}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base mt-auto"
      >
        Visit Raffle Page
      </Button>
    </div>
  );
};

const RaffleSection = ({ title, raffles, icon: Icon, stateKey }) => {
  const navigate = useNavigate();
  // Reverse for newest first
  const sortedRaffles = [...raffles].reverse();
  const displayedRaffles = sortedRaffles.slice(0, 4);

  if (raffles.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </h2>
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No {title.toLowerCase()} at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title} ({raffles.length})
        </h2>
        <button
          className="text-primary underline text-sm font-medium hover:text-primary/80 transition-colors"
          onClick={() => navigate(`/raffles/${stateKey}`)}
        >
          View all {title.toLowerCase()}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-0">
        {displayedRaffles.map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { connected } = useWallet();
  const { contracts, getContractInstance, onContractEvent } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch raffles from contracts
  const fetchRaffles = React.useCallback(async (isBackground = false) => {
    if (!connected) {
      setRaffles([]);
      setError('Please connect your wallet to view raffles');
      return;
    }
    if (!contracts.raffleManager) {
      setError('Contracts not initialized. Please try refreshing the page.');
      return;
    }
    if (isBackground) {
      setBackgroundLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const registeredRaffles = await contracts.raffleManager.getAllRaffles();
      if (registeredRaffles.length === 0) {
        setRaffles([]);
        setError('No raffles found on the blockchain');
        return;
      }
      const rafflePromises = registeredRaffles.map(async (raffleAddress) => {
        try {
          const raffleContract = getContractInstance(raffleAddress, 'raffle');
          if (!raffleContract) {
            console.error(`Failed to get raffle contract instance for ${raffleAddress}`);
            return null;
          }
          const [
            name,
            creator,
            startTime,
            duration,
            ticketPrice,
            ticketLimit,
            winnersCount,
            maxTicketsPerParticipant,
            isPrized,
            prizeCollection,
            state
          ] = await Promise.all([
            raffleContract.name(),
            raffleContract.creator(),
            raffleContract.startTime(),
            raffleContract.duration(),
            raffleContract.ticketPrice(),
            raffleContract.ticketLimit(),
            raffleContract.winnersCount(),
            raffleContract.maxTicketsPerParticipant(),
            raffleContract.isPrized(),
            raffleContract.prizeCollection(),
            raffleContract.state()
          ]);
          let ticketsSold = 0;
          try {
            let count = 0;
            while (true) {
              try {
                await raffleContract.participants(count);
                count++;
              } catch {
                break;
              }
            }
            ticketsSold = count;
          } catch (error) {
            console.warn('Could not fetch participants count for', raffleAddress, error);
          }
          let raffleState;
          if (state === 0) { raffleState = 'pending'; }
          else if (state === 1) { raffleState = 'active'; }
          else if (state === 2) { raffleState = 'drawing'; }
          else if (state === 3) { raffleState = 'completed'; }
          else if (state === 4) { raffleState = 'completed'; }
          else if (state === 5) { raffleState = 'ended'; }
          else { raffleState = 'ended'; }
          return {
            id: raffleAddress,
            name,
            address: raffleAddress,
            creator,
            startTime: startTime.toNumber(),
            duration: duration.toNumber(),
            ticketPrice,
            ticketLimit: ticketLimit.toNumber(),
            ticketsSold: ticketsSold,
            winnersCount: winnersCount.toNumber(),
            maxTicketsPerParticipant: maxTicketsPerParticipant.toNumber(),
            isPrized,
            prizeCollection: !!isPrized ? prizeCollection : null,
            state: raffleState
          };
        } catch (error) {
          console.error(`Error fetching raffle data for ${raffleAddress}:`, error);
          return null;
        }
      });
      const raffleData = await Promise.all(rafflePromises);
      const validRaffles = raffleData.filter(raffle => raffle !== null);
      setRaffles(validRaffles);
      if (validRaffles.length === 0) {
        setError('No valid raffles found on the blockchain');
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
      setError('Failed to fetch raffles from blockchain. Please check your network connection and try again.');
      setRaffles([]);
    } finally {
      if (isBackground) {
        setBackgroundLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [contracts, getContractInstance, connected]);

  useEffect(() => {
    fetchRaffles();
    const interval = setInterval(() => fetchRaffles(true), 30000);
    return () => clearInterval(interval);
  }, [fetchRaffles]);

  // Listen for contract events and refresh in background
  useEffect(() => {
    if (!onContractEvent) return;
    const unsubRaffleCreated = onContractEvent('RaffleCreated', () => {
      fetchRaffles(true);
    });
    const unsubWinnersSelected = onContractEvent('WinnersSelected', () => {
      fetchRaffles(true);
    });
    const unsubPrizeClaimed = onContractEvent('PrizeClaimed', () => {
      fetchRaffles(true);
    });
    return () => {
      unsubRaffleCreated && unsubRaffleCreated();
      unsubWinnersSelected && unsubWinnersSelected();
      unsubPrizeClaimed && unsubPrizeClaimed();
    };
  }, [onContractEvent, fetchRaffles]);

  // Categorize raffles by state
  const categorizeRaffles = () => {
    // Use actual contract state instead of time-based logic
    const pending = raffles.filter(raffle => raffle.state === 'pending');
    
    const active = raffles.filter(raffle => raffle.state === 'active');
    
    const ended = raffles.filter(raffle => raffle.state === 'ended');
    
    const drawing = raffles.filter(raffle => raffle.state === 'drawing');
    
    const completed = raffles.filter(raffle => 
      raffle.state === 'completed' || raffle.state === 'allPrizesClaimed'
    );

    return { pending, active, ended, drawing, completed };
  };

  const { pending, active, ended, drawing, completed } = categorizeRaffles();

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <PageContainer className="py-4">
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Fairness and Transparency, On-Chain</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rafflhub hosts decentralized raffles where every draw is public, auditable, and powered by Chainlink VRF. Enter for your chance to win!
          </p>
        </div>
        
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view and interact with raffles on the blockchain.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure you're connected to the Sepolia testnet to view the deployed raffles.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer className="py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading raffles from blockchain...</p>
        </div>
      </PageContainer>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <PageContainer className="py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Fairness and Transparency, On-Chain</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rafflhub hosts decentralized raffles where every draw is public, auditable, and powered by Chainlink VRF. Enter for your chance to win!
          </p>
        </div>
        
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Unable to Load Raffles</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-4 pb-16">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Fairness and Transparency, On-Chain</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Rafflhub hosts decentralized raffles where every draw is public, auditable, and powered by Chainlink VRF. Enter for your chance to win!
        </p>
      </div>

      <div className="mt-16">
        <RaffleSection title="Active Raffles" raffles={active} icon={Clock} stateKey="active" />
        <RaffleSection title="Pending Raffles" raffles={pending} icon={Users} stateKey="pending" />
        <RaffleSection title="Drawing Phase" raffles={drawing} icon={Trophy} stateKey="drawing" />
        <RaffleSection title="Ended Raffles" raffles={ended} icon={Clock} stateKey="ended" />
        <RaffleSection title="Completed Raffles" raffles={completed} icon={Ticket} stateKey="completed" />
      </div>

      {raffles.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Raffles Available</h3>
          <p className="text-muted-foreground">
            There are currently no raffles available on the blockchain. Check back later or create your own!
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export { RaffleCard };
export default LandingPage;

