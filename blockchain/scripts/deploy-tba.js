const { ethers } = require("hardhat");
const { deployProxyAndLogger, contractFactoriesLoader } = require("../utils/deploy.utils");
const { blockTimestamp } = require("../utils/test.utils");
const fs = require("fs");
require("dotenv").config();
const env = process.env;

const CHARACTER_URI = "https://res.cloudinary.com/htphong02/raw/upload/v1689755573/metadata/1.json";
const WEAPON_URI = "https://res.cloudinary.com/htphong02/raw/upload/v1689756298/metadata/weapons";

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

    const CharacterERC721 = await ethers.getContractFactory("Character");
    const characterERC721 = await CharacterERC721.deploy();
    console.log("characterERC721", characterERC721.address);
    await characterERC721.deployed();

    const Weapon = await ethers.getContractFactory("Weapon");
    const weapon = await Weapon.deploy();
    console.log("weapon", weapon.address);
    await weapon.deployed();

    const GOLD = await ethers.getContractFactory("GOLD");
    const gold = GOLD.attach('0xbec861fabb5b7dbb30369cbb3f3a41e6da8e5fae');
    const gold = await GOLD.deploy();
    console.log("gold", gold.address);
    await gold.deployed();

    const SILVER = await ethers.getContractFactory("SILVER");
    // const silver = SILVER.attach('0xc7d8bc0957fcbbbefa962362707128cd54078022');
    const silver = await SILVER.deploy();
    console.log("silver", silver.address);
    await silver.deployed();

    const TokenBoundAccount = await ethers.getContractFactory("TokenBoundAccount");
    // const tokenBoundAccount = TokenBoundAccount.attach('0x54f7ebdeeed394db442d1ba07a2cb61dd24b3c67');
    const tokenBoundAccount = await TokenBoundAccount.deploy();
    console.log("tokenBoundAccount", tokenBoundAccount.address);
    await tokenBoundAccount.deployed();

    const TokenBoundAccountRegistry = await ethers.getContractFactory("TokenBoundAccountRegistry");
    // const tokenBoundAccountRegistry = TokenBoundAccountRegistry.attach('0xfa2fc5086bda4851eeb1293f5ca25d1b61e2243c');
    const tokenBoundAccountRegistry = await TokenBoundAccountRegistry.deploy();
    console.log("tokenBoundAccountRegistry", tokenBoundAccountRegistry.address);
    await tokenBoundAccountRegistry.deployed();

    console.log("==========================================================================");
    console.log("EARLY TRANSACTION");
    console.log("==========================================================================");

    console.log("MINT CHARACTER NFT");
    let tx = await characterERC721.mint(accounts[0].address, CHARACTER_URI);
    await tx.wait();

    console.log("CREATE TOKEN BOUND ACCOUNT");
    tx = await tokenBoundAccountRegistry.createAccount(tokenBoundAccount.address, 51, characterERC721.address, 1, 200);
    const receipt = await tx.wait();
    const args = receipt.events.find((ev) => ev.event === "AccountCreated").args;
    const account = args[0];
    console.log('token bound account', account)

    
    console.log("MINT WEAPON");
    for (let i = 1; i < 5; i++) {
        let tx = await weapon.mint(accounts[0].address, `${WEAPON_URI}/${i}.json`);
        await tx.wait();
        console.log("SEND WEAPON", i);
        tx = await weapon.connect(accounts[0]).transferFrom(accounts[0].address, account, i);
        await tx.wait();
    }

    console.log("MINT GOLD AND SILVER")
    tx = await gold.mint(account, ethers.utils.parseUnits("50", 18));
    await tx.wait();
    await silver.mint(account, ethers.utils.parseUnits("43", 18));

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
