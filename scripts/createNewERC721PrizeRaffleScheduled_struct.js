const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0x4126dB3c09a9Aa656914f28726ff52628fE6054B";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    // --- Reveal Feature Parameters ---
    // RevealType Enum: 0 = Instant, 1 = Manual, 2 = Scheduled
    const revealType = 2; // Scheduled reveal
    const unrevealedBaseURI = "ipfs://QmUNREVEALED_METADATA_HASH/"; // URI for the placeholder metadata
    const revealTime = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60); // 3 days from now

    const params = {
        name: "New ERC721 Prize Raffle (Scheduled Reveal)",
        startTime: Math.floor(Date.now() / 1000) + 120, // Starts in 2 minutes
        duration: 2 * 24 * 60 * 60, // 2 days
        ticketLimit: 40,
        winnersCount: 10,
        maxTicketsPerParticipant: 10,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        erc1155Drop: false, // Make sure to include this flag
        prizeCollection: ethers.ZeroAddress,
        standard: 0, // 0 = ERC721
        prizeTokenId: 0,
        amountPerWinner: 1,
        collectionName: "My Revealed NFT Collection",
        collectionSymbol: "REVNFT",
        collectionBaseURI: "ipfs://QmREVEALED_METADATA_HASH/",
        creator: creator.address,
        royaltyPercentage: 500, // 5%
        royaltyRecipient: creator.address,
        maxSupply: 200,
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
    console.log("New ERC721 prize raffle with scheduled reveal at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
