const { ethers } = require("hardhat");
const { deployProxyAndLogger, contractFactoriesLoader } = require("../utils/deploy.utils");
const { blockTimestamp } = require('../utils/test.utils');
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
    const LendingPool = await ethers.getContractFactory("LendingPoolV3");
    const WXDC = await ethers.getContractFactory("WXDC");
    const Point = await ethers.getContractFactory("Point");

    //* Deploy contracts */
    console.log("==========================================================================");
    console.log("DEPLOYING CONTRACTS");
    console.log("==========================================================================");

    // const wXDC = await WXDC.deploy();
    // await wXDC.deployed();
    // console.log("WXDC                        deployed to:>>", wXDC.address);

    const wXDC = await WXDC.attach("0x747ae7Dcf3Ea10D242bd17bA5dfA034ca6102108");

    const lendingPool = await LendingPool.deploy(wXDC.address, "0x4F9EF07A6DDF73494D2fF51A8f7B78e9c5815eb2", "10000000000000000000", 0);
    await lendingPool.deployed();
    console.log("LendingPool                     deployed to:>>", lendingPool.address);

    console.log("==========================================================================");
    console.log("VERIFY CONTRACTS");
    console.log("==========================================================================");

    // await hre
    //     .run("verify:verify", {
    //         address: wXDC.address
    //     })
    //     .catch(console.log);

    // await hre
    //     .run("verify:verify", {
    //         address: point.address
    //     })
    //     .catch(console.log);

    // await hre
    //     .run("verify:verify", {
    //         address: lendingPool.address,
    //         constructorArguments: [wXDC.address,
    //         point.address
    //         ]
    //     })
    //     .catch(console.log);

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
