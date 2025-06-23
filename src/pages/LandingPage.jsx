import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Trophy, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const RaffleCard = ({ raffle }) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Update time remaining every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      let targetTime;
      if (raffle.state === 'pending') {
        targetTime = raffle.startTime;
      } else if (raffle.state === 'active') {
        targetTime = raffle.startTime + raffle.duration;
      } else {
        setTimeRemaining('Ended');
        return;
      }
      const remaining = targetTime - now;
      if (remaining > 0) {
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        let formatted = '';
        if (days > 0) formatted += `${days}d `;
        if (hours > 0 || days > 0) formatted += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m `;
        formatted += `${seconds}s`;
        setTimeRemaining(formatted.trim());
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

  const handleViewRaffle = () => {
    navigate(`/raffle/${raffle.address}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow min-w-[350px] flex-shrink-0">
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
          <span className="text-muted-foreground">Time Remaining:</span>
          <span>{timeRemaining}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            raffle.hasPrize 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {raffle.hasPrize ? 'Prized' : 'Non-Prized'}
          </span>
        </div>
        {raffle.hasPrize && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prize Collection:</span>
            <span className="font-mono">{raffle.prizeCollection?.slice(0, 10)}...</span>
          </div>
        )}
      </div>
      
      <button
        onClick={handleViewRaffle}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
      >
        Visit Raffle Page
      </button>
    </div>
  );
};

const RaffleSection = ({ title, raffles, icon: Icon }) => {
  const scrollRef = React.useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -370, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 370, behavior: 'smooth' });
    }
  };

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
        {raffles.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {raffles.map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { connected } = useWallet();
  const { contracts, getContractInstance } = useContract();
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch raffles from contracts
  useEffect(() => {
    const fetchRaffles = async () => {
      if (!connected) {
        setRaffles([]);
        setError('Please connect your wallet to view raffles');
        return;
      }

      if (!contracts.raffleManager) {
        console.log('RaffleManager contract not available');
        setError('Contracts not initialized. Please try refreshing the page.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Get all registered raffles from the RaffleManager using the new getAllRaffles function
        const registeredRaffles = await contracts.raffleManager.getAllRaffles();
        
        if (registeredRaffles.length === 0) {
          setRaffles([]);
          setError('No raffles found on the blockchain');
          return;
        }

        const rafflePromises = registeredRaffles.map(async (raffleAddress) => {
          try {
            // Get raffle contract instance using the contract context
            const raffleContract = getContractInstance(raffleAddress, 'raffle');
            
            if (!raffleContract) {
              console.error(`Failed to get raffle contract instance for ${raffleAddress}`);
              return null;
            }

            // Fetch raffle data
            const [
              name,
              creator,
              startTime,
              duration,
              ticketPrice,
              ticketLimit,
              winnersCount,
              maxTicketsPerParticipant,
              hasPrize,
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
              raffleContract.hasPrize(),
              raffleContract.prizeCollection(),
              raffleContract.state()
            ]);

            // Get tickets sold by checking participants count
            let ticketsSold = 0;
            try {
              // Try to get participants one by one until we hit an error
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

            // Determine raffle state based on time and contract state
            const now = Math.floor(Date.now() / 1000);
            const endTime = startTime.toNumber() + duration.toNumber();
            let raffleState;

            if (state === 0) { // Pending
              raffleState = 'pending';
            } else if (state === 1) { // Active
              raffleState = 'active';
            } else if (state === 2) { // Drawing
              raffleState = 'drawing';
            } else if (state === 3) { // Completed
              raffleState = 'completed';
            } else if (state === 4) { // AllPrizesClaimed
              raffleState = 'completed';
            } else if (state === 5) { // Ended
              raffleState = 'ended';
            } else {
              raffleState = 'ended';
            }

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
              hasPrize,
              prizeCollection: hasPrize ? prizeCollection : null,
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
        setLoading(false);
      }
    };

    fetchRaffles();

    // Set up interval to refresh raffle data every 30 seconds
    const interval = setInterval(fetchRaffles, 30000);

    return () => clearInterval(interval);
  }, [contracts, getContractInstance, connected]);

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Raffle Protocol</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exciting raffles, win amazing prizes, and be part of the decentralized raffle ecosystem.
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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading raffles from blockchain...</p>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Raffle Protocol</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover exciting raffles, win amazing prizes, and be part of the decentralized raffle ecosystem.
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Raffle Protocol</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover exciting raffles, win amazing prizes, and be part of the decentralized raffle ecosystem.
        </p>
      </div>

      <RaffleSection title="Active Raffles" raffles={active} icon={Clock} />
      <RaffleSection title="Pending Raffles" raffles={pending} icon={Users} />
      <RaffleSection title="Drawing Phase" raffles={drawing} icon={Trophy} />
      <RaffleSection title="Completed Raffles" raffles={completed} icon={Ticket} />
      <RaffleSection title="Ended Raffles" raffles={ended} icon={Clock} />

      {raffles.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Raffles Available</h3>
          <p className="text-muted-foreground">
            There are currently no raffles available on the blockchain. Check back later or create your own!
          </p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

