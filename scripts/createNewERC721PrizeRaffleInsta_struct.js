const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0x4126dB3c09a9Aa656914f28726ff52628fE6054B";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "New ERC721 Prize Raffle (Instant Reveal)",
        startTime: Math.floor(Date.now() / 1000) + 120, // Starts in 2 minutes
        duration: 2 * 24 * 60 * 60, // 2 days
        ticketLimit: 40,
        winnersCount: 10,
        maxTicketsPerParticipant: 10,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        erc1155Drop: false,
        prizeCollection: ethers.ZeroAddress,
        standard: 0, // 0 = ERC721
        prizeTokenId: 0,
        amountPerWinner: 1,
        collectionName: "My Instant NFT Collection",
        collectionSymbol: "INSTANTNFT",
        collectionBaseURI: "ipfs://QmINSTANT_METADATA_HASH/", // The final, revealed metadata URI
        creator: creator.address,
        royaltyPercentage: 500, // 5%
        royaltyRecipient: creator.address,
        maxSupply: 200,
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0,
        // --- Reveal Parameters for Instant Reveal ---
        revealType: 0, // 0 = Instant
        unrevealedBaseURI: "", // Not used for instant reveal
        revealTime: 0       // Not used for instant reveal
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New ERC721 prize raffle with instant reveal at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
