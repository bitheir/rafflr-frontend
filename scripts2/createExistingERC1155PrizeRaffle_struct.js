const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xFa68D57d9923f4Bb42331BC4508a82ec5eb4C425";
const EXISTING_COLLECTION_ADDRESS = "0xYourExistingERC1155CollectionAddress"; // <-- IMPORTANT: Set this address
const CUSTOM_TICKET_PRICE = ethers.parseEther("0.00002");

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    if (!ethers.isAddress(EXISTING_COLLECTION_ADDRESS)) throw new Error("Set EXISTING_COLLECTION_ADDRESS");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    const params = {
        name: "Existing ERC1155 Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 200,
        winnersCount: 10,
        maxTicketsPerParticipant: 10,
        isPrized: true,
        customTicketPrice: CUSTOM_TICKET_PRICE,
        erc721Drop: false,
        erc1155Drop: true, // Use existing mintable ERC1155 collection
        prizeCollection: EXISTING_COLLECTION_ADDRESS,
        standard: 1, // 1 = ERC1155
        prizeTokenId: 1, // Specify the token ID for the prize
        amountPerWinner: 5, // Each winner gets 5 tokens of the specified ID
        collectionName: "",
        collectionSymbol: "",
        collectionBaseURI: "",
        creator: creator.address,
        royaltyPercentage: 0,
        royaltyRecipient: ethers.ZeroAddress,
        maxSupply: 0,
        erc20PrizeToken: ethers.ZeroAddress,
        erc20PrizeAmount: 0,
        ethPrizeAmount: 0,
        // --- Reveal parameters are part of the existing collection's state ---
        revealType: 0,
        unrevealedBaseURI: "",
        revealTime: 0
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New existing ERC1155 prize raffle at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
