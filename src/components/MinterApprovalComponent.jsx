import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import { contractABIs } from '../contracts/contractABIs';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Lock, 
  Unlock, 
  UserPlus, 
  UserMinus,
  Loader2,
  Info
} from 'lucide-react';

const MinterApprovalComponent = () => {
  const { address, connected } = useWallet();
  const { provider } = useContract();
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [minterAddress, setMinterAddress] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentMinter, setCurrentMinter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user's collections
  useEffect(() => {
    if (connected && address) {
      loadUserCollections();
    }
  }, [connected, address]);

  // Load collection details when selected
  useEffect(() => {
    if (selectedCollection) {
      loadCollectionDetails();
    }
  }, [selectedCollection]);

  const loadUserCollections = async () => {
    try {
      setLoading(true);
      setError('');
      
      // This would typically come from your backend or contract events
      // For now, we'll use a placeholder - in a real implementation,
      // you'd query the NFTFactory or other contracts to get user's collections
      const mockCollections = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'My NFT Collection 1',
          symbol: 'MNFT1'
        },
        {
          address: '0x0987654321098765432109876543210987654321',
          name: 'My NFT Collection 2',
          symbol: 'MNFT2'
        }
      ];
      
      setCollections(mockCollections);
    } catch (err) {
      setError('Failed to load collections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionDetails = async () => {
    if (!selectedCollection || !provider) return;

    try {
      setLoading(true);
      setError('');

      const contract = new ethers.Contract(
        selectedCollection,
        contractABIs.erc721Prize,
        provider
      );

      // Check if minter approval is locked
      const locked = await contract.minterLocked();
      setIsLocked(locked);

      // If a minter address is provided, check if they are the current minter
      if (minterAddress && ethers.isAddress(minterAddress)) {
        const currentMinter = await contract.minter();
        setIsApproved(currentMinter.toLowerCase() === minterAddress.toLowerCase());
        setCurrentMinter(currentMinter);
      }
    } catch (err) {
      setError('Failed to load collection details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setMinterApproval = async (approved) => {
    if (!selectedCollection || !minterAddress || !provider) {
      setError('Please select a collection and enter a valid minter address');
      return;
    }

    if (!ethers.isAddress(minterAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        selectedCollection,
        contractABIs.erc721Prize,
        signer
      );

      const tx = await contract.setMinterApproval(minterAddress, approved);
      await tx.wait();

      setSuccess(`Minter ${approved ? 'set' : 'removed'} successfully!`);
      setIsApproved(approved);
      
      // Clear the minter address after successful operation
      setMinterAddress('');
    } catch (err) {
      setError('Failed to set minter approval: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMinterApprovalLock = async () => {
    if (!selectedCollection || !provider) {
      setError('Please select a collection first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        selectedCollection,
        contractABIs.erc721Prize,
        signer
      );

      let tx;
      if (isLocked) {
        tx = await contract.unlockMinterApproval();
      } else {
        tx = await contract.lockMinterApproval();
      }
      
      await tx.wait();

      setSuccess(`Minter approval ${isLocked ? 'unlocked' : 'locked'} successfully!`);
      setIsLocked(!isLocked);
    } catch (err) {
      setError(`Failed to ${isLocked ? 'unlock' : 'lock'} minter approval: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (address) => {
    return ethers.isAddress(address);
  };

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Minter Approval Management
          </CardTitle>
          <CardDescription>
            Please connect your wallet to manage minter approvals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to manage minter approvals.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Minter Approval Management
        </CardTitle>
        <CardDescription>
          Manage minter for your ERC721 prize collections. Control who can mint tokens from your collections.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collection Selection */}
        <div className="space-y-2">
          <Label htmlFor="collection">Select Collection</Label>
          <select
            id="collection"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
            disabled={loading}
          >
            <option value="">Choose a collection...</option>
            {collections.map((collection) => (
              <option key={collection.address} value={collection.address}>
                {collection.name} ({collection.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Collection Status */}
        {selectedCollection && (
          <div className="space-y-2">
            <Label>Collection Status</Label>
            <div className="flex items-center gap-2">
              <Badge variant={isLocked ? "destructive" : "default"}>
                {isLocked ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Minter Approval Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Minter Approval Unlocked
                  </>
                )}
              </Badge>
            </div>
            {currentMinter && (
              <div className="mt-2">
                <Label className="text-sm">Current Minter</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {currentMinter}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {isLocked 
                ? "Minter approvals are locked. No new approvals can be set until unlocked."
                : "Minter approvals are unlocked. You can set new approvals."
              }
            </p>
          </div>
        )}

        {/* Minter Approval Control */}
        {selectedCollection && !isLocked && (
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="minter">Minter Address</Label>
              <Input
                id="minter"
                type="text"
                placeholder="0x..."
                value={minterAddress}
                onChange={(e) => setMinterAddress(e.target.value)}
                disabled={loading}
              />
              {minterAddress && !validateAddress(minterAddress) && (
                <p className="text-sm text-red-600">Invalid Ethereum address</p>
              )}
            </div>

            {minterAddress && validateAddress(minterAddress) && (
              <div className="space-y-2">
                <Label>Current Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={isApproved ? "default" : "secondary"}>
                    {isApproved ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Is Current Minter
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Current Minter
                      </>
                    )}
                  </Badge>
                </div>
                {isApproved && (
                  <p className="text-sm text-green-600">
                    This address is currently the minter for this collection.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setMinterApproval(true)} disabled={loading || !minterAddress || !validateAddress(minterAddress) || isApproved} className="fancy flex-1 h-12 px-6">
                <span className="top-key"></span>
                <span className="text">Set as Minter</span>
                <span className="bottom-key-1"></span>
                <span className="bottom-key-2"></span>
              </button>
              <button onClick={() => setMinterApproval(false)} disabled={loading || !minterAddress || !validateAddress(minterAddress) || !isApproved} className="fancy flex-1 h-12 px-6">
                <span className="top-key"></span>
                <span className="text">Remove as Minter</span>
                <span className="bottom-key-1"></span>
                <span className="bottom-key-2"></span>
              </button>
            </div>
          </div>
        )}

        {/* Lock/Unlock Control */}
        {selectedCollection && (
          <div className="space-y-2">
            <Label>Approval Lock Control</Label>
            <button onClick={toggleMinterApprovalLock} disabled={loading} className="fancy w-full h-12 px-6">
              <span className="top-key"></span>
              <span className="text">{isLocked ? 'Unlock Minter Approval' : 'Lock Minter Approval'}</span>
              <span className="bottom-key-1"></span>
              <span className="bottom-key-2"></span>
            </button>
            <p className="text-sm text-muted-foreground">
              {isLocked 
                ? "Unlocking will allow you to set new minter approvals."
                : "Locking will prevent any new minter approvals from being set."
              }
            </p>
          </div>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> The minter is the address that can mint tokens from your collection. 
            When minter approval is locked, no new minters can be set, but the current minter can still mint. 
            This provides security by preventing unauthorized minting after your collection is configured.
          </AlertDescription>
        </Alert>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default MinterApprovalComponent; 