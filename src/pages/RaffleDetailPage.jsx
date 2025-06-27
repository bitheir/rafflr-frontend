import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Clock, Trophy, Users, ArrowLeft, AlertCircle, CheckCircle, DollarSign, Trash2 } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const TicketPurchaseSection = ({ raffle, onPurchase }) => {
  const { connected } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      await onPurchase(quantity);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const canPurchaseTickets = () => {
    // Can only purchase tickets if raffle is active
    return raffle.state === 'active';
  };

  const totalCost = ethers.utils.formatEther(
    ethers.BigNumber.from(raffle.ticketPrice || '0').mul(quantity)
  );

  const remainingTickets = raffle.ticketLimit - raffle.ticketsSold;
  const maxPurchasable = Math.min(
    remainingTickets,
    raffle.maxTicketsPerParticipant,
    raffle.userTicketsRemaining || raffle.maxTicketsPerParticipant
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Ticket className="h-5 w-5" />
        Purchase Tickets
      </h3>

      {!canPurchaseTickets() ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {raffle.state === 'pending' 
              ? 'Raffle has not started yet' 
              : 'Raffle has ended'}
          </p>
        </div>
      ) : remainingTickets <= 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">All tickets have been sold!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Price per ticket:</span>
              <p className="font-semibold text-lg">{ethers.utils.formatEther(raffle.ticketPrice || '0')} ETH</p>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining tickets:</span>
              <p className="font-semibold text-lg">{remainingTickets}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Your tickets:</span>
              <p className="font-semibold text-lg">{raffle.userTickets || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Max per user:</span>
              <p className="font-semibold text-lg">{raffle.maxTicketsPerParticipant}</p>
            </div>
          </div>

          {maxPurchasable > 0 ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={maxPurchasable}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxPurchasable, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: {maxPurchasable} tickets
                </p>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">{totalCost} ETH</span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={loading || !connected}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ticket className="h-4 w-4" />
                {loading ? 'Processing...' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                You have reached the maximum number of tickets for this raffle.
              </p>
            </div>
          )}

          {!connected && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Please connect your wallet to purchase tickets.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PrizeImageCard = ({ raffle }) => {
  const { getContractInstance } = useContract();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrizeImage() {
      if (!raffle.isPrized) return;
      setLoading(true);
      try {
        let uri;
        if (raffle.standard === 0) {
          const contract = getContractInstance(raffle.prizeCollection, 'erc721prize');
          uri = await contract.tokenURI(raffle.prizeTokenId);
        } else if (raffle.standard === 1) {
          const contract = getContractInstance(raffle.prizeCollection, 'erc1155prize');
          uri = await contract.uri(raffle.prizeTokenId);
        } else {
          setImageUrl(null);
          setLoading(false);
          return;
        }
        if (uri.startsWith('ipfs://')) {
          uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        if (raffle.standard === 1 && uri.includes('{id}')) {
          const hexId = BigInt(raffle.prizeTokenId).toString(16).padStart(64, '0');
          uri = uri.replace('{id}', hexId);
        }
        const res = await fetch(uri);
        const metadata = await res.json();
        setImageUrl(metadata.image || null);
      } catch (err) {
        setImageUrl(null);
      }
      setLoading(false);
    }
    if (raffle.isPrized) fetchPrizeImage();
  }, [raffle, getContractInstance]);

  if (!raffle.isPrized || loading || !imageUrl) return null;

  return (
    <Card className="h-full flex flex-col items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center">
        <img
          src={imageUrl}
          alt="Prize Art"
          className="w-48 h-48 object-contain rounded-lg border"
          style={{ background: '#fff' }}
        />
      </CardContent>
    </Card>
  );
};

const WinnersSection = ({ raffle }) => {
  const { getContractInstance } = useContract();
  const { address: connectedAddress } = useWallet();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      if (raffle.state !== 'completed' && raffle.state !== 'allPrizesClaimed') {
        setWinners([]);
        return;
      }
      setLoading(true);
      try {
        const raffleContract = getContractInstance && getContractInstance(raffle.address, 'raffle');
        if (!raffleContract) {
          setWinners([]);
          setLoading(false);
          return;
        }
        // Fetch winnersCount
        const winnersCount = await raffleContract.winnersCount();
        const count = winnersCount.toNumber ? winnersCount.toNumber() : Number(winnersCount);
        // Fetch each winner by index
        const winnersArray = await Promise.all(
          Array.from({ length: count }, async (_, i) => {
            try {
              const winnerAddress = await raffleContract.winners(i);
              const claimedWins = await raffleContract.claimedWins(winnerAddress);
              return {
                address: winnerAddress,
                index: i,
                claimedWins: claimedWins.toNumber ? claimedWins.toNumber() : Number(claimedWins),
                prizeClaimed: (claimedWins.toNumber ? claimedWins.toNumber() : Number(claimedWins)) > 0
              };
            } catch (error) {
              return {
                address: '0x0000000000000000000000000000000000000000',
                index: i,
                claimedWins: 0,
                prizeClaimed: false
              };
            }
          })
        );
        setWinners(winnersArray);
      } catch (error) {
        setWinners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, [raffle, getContractInstance]);

  const getStateDisplay = () => {
    switch (raffle.state) {
      case 'pending':
        return (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Pending</h3>
            <p className="text-muted-foreground">Winners will be announced after the raffle ends and drawing is complete.</p>
          </div>
        );
      case 'active':
        return (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Active</h3>
            <p className="text-muted-foreground">Raffle is currently active. Winners will be announced after it ends.</p>
          </div>
        );
      case 'ended':
        return (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Raffle Ended</h3>
            <p className="text-muted-foreground">Raffle has ended. Waiting for winner selection.</p>
          </div>
        );
      case 'drawing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Drawing in Progress</h3>
            <p className="text-muted-foreground">Winners are being selected. Please wait...</p>
          </div>
        );
      case 'completed':
      case 'allPrizesClaimed':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Winners Announced</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading winners...</p>
              </div>
            ) : winners.length > 0 ? (
              <div className="space-y-3">
                {winners.map((winner) => (
                  <div key={winner.index} className={`flex items-center justify-between p-3 bg-muted rounded-lg ${connectedAddress && winner.address.toLowerCase() === connectedAddress.toLowerCase() ? 'bg-green-100 border-green-400 text-green-900 font-bold' : ''}`}>
                    <div>
                      <p className="font-medium">Winner #{winner.index + 1}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {winner.address.slice(0, 10)}...{winner.address.slice(-8)}
                      </p>
                      {raffle.isPrized && (
                        <p className="text-xs text-muted-foreground">
                          Prizes claimed: {winner.claimedWins}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {raffle.isPrized ? (
                        winner.prizeClaimed ? (
                          <span className="text-green-600 text-sm">Claimed</span>
                        ) : (
                          <span className="text-orange-600 text-sm">Pending</span>
                        )
                      ) : (
                        <span className="text-blue-600 text-sm">Winner</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No winners data available.</p>
            )}
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unknown raffle state.</p>
          </div>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Winners</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-96">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading winners...</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No winners yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {winners.map((winner) => (
              <div
                key={winner.index}
                className={`bg-muted rounded-md py-2 px-4 flex items-center justify-between border border-border ${connectedAddress && winner.address.toLowerCase() === connectedAddress.toLowerCase() ? 'bg-green-100 border-green-400 text-green-900 font-bold' : ''}`}
              >
                <span className="font-mono text-sm break-all">{winner.address}</span>
                {winner.prizeClaimed && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function formatDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) formatted += `${minutes}m`;
  if (!formatted) formatted = '0m';
  return formatted.trim();
}

const RaffleDetailPage = () => {
  const { raffleAddress } = useParams();
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const { getContractInstance, executeTransaction } = useContract();
  
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Fetch actual raffle data from blockchain
  useEffect(() => {
    const fetchRaffleData = async () => {
      setLoading(true);
      try {
        if (!raffleAddress) {
          throw new Error('No raffle address provided');
        }
        // Wait for wallet connection and signer
        if (!connected || !getContractInstance) {
          setLoading(true);
          return;
        }
        const raffleContract = getContractInstance(raffleAddress, 'raffle');
        if (!raffleContract) {
          setLoading(true);
          return;
        }

        // Fetch basic raffle data
        const [name, creator, startTime, duration, ticketPrice, ticketLimit, winnersCount, maxTicketsPerParticipant, isPrizedContract, prizeCollection, prizeTokenId, standard] = await Promise.all([
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
          raffleContract.prizeTokenId(),
          raffleContract.standard(),
        ]);

        // Get tickets sold by counting participants
        let ticketsSold = 0;
        try {
          // Try to get participants count if the contract has this method
          const participantsCount = await raffleContract.getParticipantsCount();
          ticketsSold = participantsCount.toNumber();
        } catch (error) {
          // Fallback: count participants by iterating through the array
          let index = 0;
          while (true) {
            try {
              await raffleContract.participants(index);
              ticketsSold++;
              index++;
            } catch {
              break;
            }
          }
        }

        // Get raffle state from contract
        const contractState = await raffleContract.state();
        
        // Map contract state enum to string
        let state;
        switch (contractState) {
          case 0: // Pending
            state = 'pending';
            break;
          case 1: // Active
            state = 'active';
            break;
          case 2: // Drawing
            state = 'drawing';
            break;
          case 3: // Completed
            state = 'completed';
            break;
          case 4: // AllPrizesClaimed
            state = 'completed';
            break;
          case 5: // Ended
            state = 'ended';
            break;
          default:
            state = 'unknown';
        }

        // Get user-specific data if connected
        let userTickets = 0;
        let userTicketsRemaining = maxTicketsPerParticipant.toNumber();
        
        if (connected && address) {
          try {
            // Try to get user's ticket count directly if available
            const userTicketCount = await raffleContract.ticketsPurchased(address);
            userTickets = userTicketCount.toNumber();
            userTicketsRemaining = Math.max(0, maxTicketsPerParticipant.toNumber() - userTickets);
          } catch (error) {
            console.warn('Could not fetch user ticket data:', error);
            // Fallback: count user participations manually
            let index = 0;
            while (index < ticketsSold) {
              try {
                const participant = await raffleContract.participants(index);
                if (participant.toLowerCase() === address.toLowerCase()) {
                  userTickets++;
                }
                index++;
              } catch {
                break;
              }
            }
            userTicketsRemaining = Math.max(0, maxTicketsPerParticipant.toNumber() - userTickets);
          }
        }

        const isPrized = !!isPrizedContract;

        const raffleData = {
          address: raffleAddress,
          name,
          creator,
          startTime: startTime.toNumber(),
          duration: duration.toNumber(),
          ticketPrice,
          ticketLimit: ticketLimit.toNumber(),
          ticketsSold,
          winnersCount: winnersCount.toNumber(),
          maxTicketsPerParticipant: maxTicketsPerParticipant.toNumber(),
          isPrized,
          prizeCollection: !!isPrized ? prizeCollection : null,
          state: state
        };
        
        setRaffle(raffleData);
      } catch (error) {
        console.error('Error fetching raffle data:', error);
        alert('Error loading raffle data: ' + error.message);
        // Navigate back if raffle doesn't exist
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (raffleAddress && getContractInstance) {
      fetchRaffleData();
    }
  }, [raffleAddress, getContractInstance, connected, address, navigate]);

  // Update countdown timer
  useEffect(() => {
    if (!raffle) return;
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

  const handlePurchaseTickets = async (quantity) => {
    if (!connected || !raffle) {
      throw new Error('Wallet not connected or raffle not loaded');
    }

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
      alert(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      // Refresh raffle data
      window.location.reload();
    } else {
      throw new Error(result.error);
    }
  };

  const handleDeleteRaffle = async () => {
    if (!connected || !raffle) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if current user is the creator
    if (address?.toLowerCase() !== raffle.creator.toLowerCase()) {
      alert('Only the raffle creator can delete this raffle');
      return;
    }

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
        // Navigate back to home page after successful deletion
        navigate('/');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Error deleting raffle: ' + error.message);
    }
  };

  const canDelete = () => {
    // Can delete if user is the creator and raffle is in pending or active state
    return connected && 
           address?.toLowerCase() === raffle?.creator.toLowerCase() && 
           (raffle?.state === 'pending' || raffle?.state === 'active');
  };

  const getStatusBadge = () => {
    if (!raffle) return null;

    // Use the actual contract state instead of time-based logic
    switch (raffle.state) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>;
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>;
      case 'drawing':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Drawing</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Completed</span>;
      case 'ended':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Ended</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading raffle details...</p>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Raffle Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The raffle you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Raffles
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{raffle.name}</h1>
            <p className="text-muted-foreground">
              Created by {raffle.creator.slice(0, 10)}...{raffle.creator.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {canDelete() && (
              <button
                onClick={handleDeleteRaffle}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-pink-700 transition-colors text-sm font-medium"
                title={raffle.ticketsSold > 0 ? "Delete raffle (refunds will be processed automatically)" : "Delete this raffle"}
              >
                <Trash2 className="h-4 w-4" />
                Delete Raffle
              </button>
            )}
            {/* Mint to Winner button for creator */}
            {connected && address?.toLowerCase() === raffle.creator.toLowerCase() && (
              <Button
                onClick={async () => {
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
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                Mint to Winner
              </Button>
            )}
          </div>
        </div>
        
        {/* Show deletion info for creators */}
        {canDelete() && raffle.ticketsSold > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ As the raffle creator, you can delete this raffle. Deletion will automatically process refunds for all {raffle.ticketsSold} sold tickets.
            </p>
          </div>
        )}
        
        {/* Show info when user is creator but can't delete */}
        {connected && 
         address?.toLowerCase() === raffle.creator.toLowerCase() && 
         !canDelete() && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-800">
              ℹ️ As the raffle creator, you can only delete this raffle when it's in pending or active state.
            </p>
          </div>
        )}
      </div>

      {/* Raffle Info */}
      <div className="mb-8 p-6 bg-muted/20 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{raffle.ticketsSold}</p>
            <p className="text-sm text-muted-foreground">Tickets Sold</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{raffle.ticketLimit}</p>
            <p className="text-sm text-muted-foreground">Total Tickets</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{raffle.winnersCount}</p>
            <p className="text-sm text-muted-foreground">Winners</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{timeRemaining}</p>
            <p className="text-sm text-muted-foreground">Time Remaining</p>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Half - Raffle Engagement */}
        <div className="space-y-6">
          <TicketPurchaseSection raffle={raffle} onPurchase={handlePurchaseTickets} />
          
          {/* Additional Raffle Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Raffle Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Address:</span>
                <span className="font-mono">{raffle.address.slice(0, 10)}...{raffle.address.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Time:</span>
                <span>{new Date(raffle.startTime * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{formatDuration(raffle.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Price:</span>
                <span>{ethers.utils.formatEther(raffle.ticketPrice)} ETH</span>
              </div>
              {raffle.isPrized && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prize Collection:</span>
                  <span className="font-mono">{raffle.prizeCollection.slice(0, 10)}...{raffle.prizeCollection.slice(-8)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Half - Prize Art and Winners */}
        <div className="flex flex-col gap-6 h-full">
          <PrizeImageCard raffle={raffle} />
          <WinnersSection raffle={raffle} />
        </div>
      </div>
    </div>
  );
};

export default RaffleDetailPage;

