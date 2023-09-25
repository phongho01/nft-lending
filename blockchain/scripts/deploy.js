const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();
const env = process.env;

async function main() {
    //* Get network */
    const accounts = await ethers.getSigners();

    console.log("==========================================================================");
    console.log("ACCOUNTS:");
    console.log("==========================================================================");
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        console.log(` Account ${i}: ${account.address}`);
    }

    //* Loading contract factory */
    const PermittedNFTs = await ethers.getContractFactory("PermittedNFTs");
    const LoanChecksAndCalculations = await hre.ethers.getContractFactory('LoanChecksAndCalculations');
    const NFTfiSigningUtils = await hre.ethers.getContractFactory('NFTfiSigningUtils');
    const LendingPool = await ethers.getContractFactory("LendingPoolV3");
    const WXDC = await ethers.getContractFactory("WXDC");
    const LiquidateNFTPool = await ethers.getContractFactory("LiquidateNFTPool");

    //* Deploy contracts */
    console.log("==========================================================================");
    console.log("DEPLOYING CONTRACTS");
    console.log("==========================================================================");

    const treasury = "0x4F9EF07A6DDF73494D2fF51A8f7B78e9c5815eb2";

    let loanChecksAndCalculations = await LoanChecksAndCalculations.deploy();
    await loanChecksAndCalculations.deployed()
    console.log("Library LoanChecksAndCalculations deployed to:", loanChecksAndCalculations.address);

    let nftfiSigningUtils = await NFTfiSigningUtils.deploy();
    await nftfiSigningUtils.deployed()
    console.log("Library NFTfiSigningUtils deployed to:", nftfiSigningUtils.address);

    const permittedNFTs = await PermittedNFTs.deploy(accounts[0].address);
    await permittedNFTs.deployed();
    console.log("PermittedNFTs                        deployed to:>>", permittedNFTs.address);

    const liquidateNFTPool = await LiquidateNFTPool.deploy(accounts[0].address);
    await liquidateNFTPool.deployed();
    console.log("LiquidateNFTPool                        deployed to:>>", liquidateNFTPool.address);

    const wXDC = await WXDC.deploy();
    await wXDC.deployed();
    console.log("wXDC                        deployed to:>>", wXDC.address);

    // const loanChecksAndCalculations = await LoanChecksAndCalculations.attach("0x25871c12c98b015f626b558763888c5c433af084");
    // const nftfiSigningUtils = await NFTfiSigningUtils.attach("0x3fdc671d4c10d4806b8e8670d96960fa4fe73f78");
    // const permittedNFTs = await PermittedNFTs.attach("0xe55df49fc37cc4795810607f51aee537a549014d");
    // const wXDC = await WXDC.attach("0x8cbace0bdd6e99bec44b8b5dbd0f30297aaf267b");
    // const liquidateNFTPool = await LiquidateNFTPool.attach("0xf31a2e258bec65a46fb54cd808294ce215070150");

    const lendingPool = await LendingPool.deploy(wXDC.address, treasury, "10000000000000000000", 0);
    await lendingPool.deployed();
    console.log("LendingPool                     deployed to:>>", lendingPool.address);

    // const lendingPool = await LendingPool.attach("0xeca64907285fe80732bba2f81d8810bafca77790");

    const DirectLoanFixedOffer = await ethers.getContractFactory("DirectLoanFixedOffer", {
        libraries: {
            LoanChecksAndCalculations: loanChecksAndCalculations.address,
            NFTfiSigningUtils: nftfiSigningUtils.address
        },
    });

    const directLoanFixedOffer = await DirectLoanFixedOffer.deploy(accounts[0].address, lendingPool.address, liquidateNFTPool.address, permittedNFTs.address, [wXDC.address]);
    await directLoanFixedOffer.deployed();
    console.log("DirectLoanFixedOffer                        deployed to:>>", directLoanFixedOffer.address);

    const tx = await lendingPool.approve(directLoanFixedOffer.address, ethers.constants.MaxUint256);
    console.log(tx)
    console.log("==========================================================================");
    console.log("DONE");
    console.log("==========================================================================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
