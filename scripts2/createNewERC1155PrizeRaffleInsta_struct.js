const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0x4126dB3c09a9Aa656914f28726ff52628fE6054B";

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "New ERC1155 Prize Raffle (Instant Reveal)",
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
        prizeTokenId: 1,
        amountPerWinner: 10,
        collectionName: "My Instant ERC1155 Trophies",
        collectionSymbol: "INSTANTTROPHY",
        collectionBaseURI: "ipfs://QmINSTANT_ERC1155_HASH/", // Base URI for revealed metadata
        creator: creator.address,
        royaltyPercentage: 250, // 2.5%
        royaltyRecipient: creator.address,
        maxSupply: 1000,
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0,
        // --- Reveal Parameters for Instant Reveal ---
        revealType: 0, // 0 = Instant
        unrevealedBaseURI: "", // Not used
        revealTime: 0       // Not used
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New ERC1155 prize raffle with instant reveal at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
