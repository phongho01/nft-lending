const { ethers } = require("hardhat");
const { deployProxyAndLogger, contractFactoriesLoader } = require("../utils/deploy.utils");
const { blockTimestamp } = require("../utils/test.utils");
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

    // const MockERC721 = await ethers.getContractFactory("Weapon");
    // const mockERC721 = await MockERC721.deploy();
    // console.log("mockERC721", mockERC721.address);

    // const TokenBoundAccount = await ethers.getContractFactory("TokenBoundAccount");
    // const tokenBoundAccount = await TokenBoundAccount.deploy();
    // console.log("tokenBoundAccount", tokenBoundAccount.address);

    const TokenBoundAccountRegistry = await ethers.getContractFactory("TokenBoundAccountRegistry");
    const tokenBoundAccountRegistry = await TokenBoundAccountRegistry.deploy();
    console.log("tokenBoundAccountRegistry", tokenBoundAccountRegistry.address);

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
