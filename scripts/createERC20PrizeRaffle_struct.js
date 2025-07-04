const { ethers } = require("hardhat");

const RAFFLE_DEPLOYER_ADDRESS = "0xD7fD72d4Dba1229Bc1b841e1655b2bDA615b8C17";
const ERC20_PRIZE_TOKEN = "0xE4aB69C077896252FAFBD49EFD26B5D171A32410";
const ERC20_PRIZE_AMOUNT = ethers.parseUnits("1", 18); // 1 token (edit decimals as needed)

async function main() {
    const [creator] = await ethers.getSigners();
    if (!ethers.isAddress(RAFFLE_DEPLOYER_ADDRESS)) throw new Error("Set RAFFLE_DEPLOYER_ADDRESS");
    if (!ethers.isAddress(ERC20_PRIZE_TOKEN)) throw new Error("Set ERC20_PRIZE_TOKEN");
    const raffleDeployer = await ethers.getContractAt("RaffleDeployer", RAFFLE_DEPLOYER_ADDRESS);

    // Approve RaffleDeployer to transfer ERC20 prize
    const erc20 = await ethers.getContractAt("IERC20", ERC20_PRIZE_TOKEN);
    const approveTx = await erc20.approve(RAFFLE_DEPLOYER_ADDRESS, ERC20_PRIZE_AMOUNT);
    await approveTx.wait(1);

    const params = {
        name: "ERC20 Prize Raffle",
        startTime: Math.floor(Date.now() / 1000) + 120,
        duration: 2 * 24 * 60 * 60,
        ticketLimit: 100,
        winnersCount: 1,
        maxTicketsPerParticipant: 2,
        isPrized: true,
        customTicketPrice: 0,
        erc721Drop: false,
        prizeCollection: ethers.ZeroAddress,
        standard: 2, // ERC20
        prizeTokenId: 0,
        amountPerWinner: 0,
        collectionName: "",
        collectionSymbol: "",
        collectionBaseURI: "",
        creator: creator.address,
        royaltyPercentage: 0,
        royaltyRecipient: ethers.ZeroAddress,
        maxSupply: 0,
        erc20PrizeToken: ERC20_PRIZE_TOKEN,
        erc20PrizeAmount: ERC20_PRIZE_AMOUNT,
        ethPrizeAmount: 0
    };

    const tx = await raffleDeployer.createRaffle(params);
    const receipt = await tx.wait(1);
    const event = receipt.logs.find(log => log.eventName === 'RaffleCreated');
    if (!event) throw new Error("No RaffleCreated event");
    console.log("New ERC20 prize raffle at:", event.args.raffle);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 