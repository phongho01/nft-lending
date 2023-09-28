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
    const LoanChecksAndCalculations = await hre.ethers.getContractFactory("LoanChecksAndCalculations");
    const NFTfiSigningUtils = await hre.ethers.getContractFactory("NFTfiSigningUtils");
    const LendingPool = await ethers.getContractFactory("LendingPoolV3");
    const WXDC = await ethers.getContractFactory("WXDC");
    const LiquidateNFTPool = await ethers.getContractFactory("LiquidateNFTPool");
    const ChonkSociety = await ethers.getContractFactory("ChonkSociety");

    //* Deploy contracts */
    console.log("==========================================================================");
    console.log("DEPLOYING CONTRACTS");
    console.log("==========================================================================");

    const treasury = "0x4F9EF07A6DDF73494D2fF51A8f7B78e9c5815eb2";

    // let loanChecksAndCalculations = await LoanChecksAndCalculations.deploy();
    // await loanChecksAndCalculations.deployed();
    // console.log("Library LoanChecksAndCalculations deployed to:", loanChecksAndCalculations.address);

    // let nftfiSigningUtils = await NFTfiSigningUtils.deploy();
    // console.log("Library NFTfiSigningUtils deployed to:", nftfiSigningUtils.address);
    // await nftfiSigningUtils.deployed();

    // const permittedNFTs = await PermittedNFTs.deploy(accounts[0].address);
    // console.log("PermittedNFTs                        deployed to:>>", permittedNFTs.address);
    // await permittedNFTs.deployed();

    const liquidateNFTPool = await LiquidateNFTPool.deploy(accounts[0].address);
    console.log("LiquidateNFTPool                        deployed to:>>", liquidateNFTPool.address);
    await liquidateNFTPool.deployed();

    // const wXDC = await WXDC.deploy();
    // console.log("wXDC                        deployed to:>>", wXDC.address);
    // await wXDC.deployed();

    // const chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
    // console.log("chonkSociety                    deployed to:>>", chonkSociety.address);
    // await chonkSociety.deployed();

    const loanChecksAndCalculations = LoanChecksAndCalculations.attach("0xba7c9198b40c014504F55549Ef1A52f830a0e883");
    const nftfiSigningUtils = NFTfiSigningUtils.attach("0xD3099DeA9039148109cE65669960202f948b65fD");
    const permittedNFTs = PermittedNFTs.attach("0xD3099DeA9039148109cE65669960202f948b65fD");
    // const liquidateNFTPool = LiquidateNFTPool.attach("0xef79bdc94d2932e8af54a9ce0c9a9026381797bb");
    const wXDC = WXDC.attach("0xfEa8B79984920F9D3B02207F17501015D1bdEe60");
    const chonkSociety = ChonkSociety.attach("0xF485b0f0140E416556B32a8390771Baddb1561cD");
    // const lendingPool = LendingPool.attach("0x92e18c48a70cb9571f53d75aba90b93efa5ec558")

    const lendingPool = await LendingPool.deploy(wXDC.address, treasury, "10000000000000000000", 0);
    console.log("LendingPool                     deployed to:>>", lendingPool.address);
    await lendingPool.deployed();

    const DirectLoanFixedOffer = await ethers.getContractFactory("DirectLoanFixedOffer", {
        libraries: {
            LoanChecksAndCalculations: loanChecksAndCalculations.address,
            NFTfiSigningUtils: nftfiSigningUtils.address,
        },
    });

    const directLoanFixedOffer = await DirectLoanFixedOffer.deploy(accounts[0].address, lendingPool.address, liquidateNFTPool.address, permittedNFTs.address, [wXDC.address]);
    console.log("DirectLoanFixedOffer                        deployed to:>>", directLoanFixedOffer.address);
    await directLoanFixedOffer.deployed();

    let tx = await lendingPool.approve(directLoanFixedOffer.address, ethers.constants.MaxUint256);
    console.log("approve", tx.hash);

    tx = await permittedNFTs.setNFTPermit(chonkSociety.address, true);
    console.log("permittedNFTs", tx.hash);
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
