const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xc0C162cbBD3bC92e166786E831b19c6329552331";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    // --- Reveal Feature Parameters ---
    // RevealType Enum: 0 = Instant, 1 = Manual, 2 = Scheduled
    const revealType = 2; // Scheduled reveal
    const unrevealedBaseURI = "ipfs://QmUNREVEALED_ERC1155_HASH/";
    const revealTime = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60); // 3 days from now

    const params = {
        name: "New ERC1155 Prize Raffle (Scheduled Reveal)",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 50,
        winnersCount: 5,
        maxTicketsPerParticipant: 5,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        erc1155Drop: false,
        prizeCollection: ethers.ZeroAddress,
        standard: 1, // 1 = ERC1155
        prizeTokenId: 1, // For new ERC1155 collections, the factory often defaults to token ID 1
        amountPerWinner: 10, // Each winner gets 10 tokens
        collectionName: "My ERC1155 Trophies", // Name is for off-chain use, not stored in contract
        collectionSymbol: "TROPHY", // Symbol is for off-chain use
        collectionBaseURI: "ipfs://QmREVEALED_ERC1155_HASH/", // Base URI for revealed metadata
        creator: creator.address,
        royaltyPercentage: 250, // 2.5%
        royaltyRecipient: creator.address,
        maxSupply: 1000, // Total supply for this token ID
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0,
        // --- New Reveal Parameters ---
        revealType: revealType,
        unrevealedBaseURI: unrevealedBaseURI,
        revealTime: revealTime
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New ERC1155 prize raffle with scheduled reveal at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
