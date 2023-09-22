const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    //* Get network */
    const accounts = await ethers.getSigners();

    //* Loading contract factory */
    // const PermittedNFTs = await ethers.getContractFactory("PermittedNFTs");
    // const permittedNFT = PermittedNFTs.attach('0xe55DF49fc37CC4795810607f51AEE537a549014d');
    // const tx = await permittedNFT.connect(accounts[0]).setNFTPermit('0x0Cc14B1adcEd0804014449C18ddfF71a426a1bD0', true)
    // console.log(tx);

    // const DirectLoanFixedOffer = await ethers.getContractFactory("DirectLoanFixedOffer", {
    //     libraries: {
    //         LoanChecksAndCalculations: "0xF46E912d82e49104d332D69c2A9E1Aa0B7440892",
    //         NFTfiSigningUtils: "0x4A0c460a775404B87674E2fBff48CA6607b7fBB3",
    //     },
    // });

    // const loanId = "0x00277cd755dfc5c1ea413df8e2e6f91857aed441a9aa7f5394aca54fedce1332";
    // const loan = DirectLoanFixedOffer.attach("0xd5adFc323047792d60D36aF9fF3D7867442127D2");
    // console.log(await loan.loanIdToLoan(loanId));
    // const tx = await loan.payBackLoan(loanId);
    // console.log(tx)
    // const tx = await loan.connect(accounts[0]).setERC20Permit("0x747ae7Dcf3Ea10D242bd17bA5dfA034ca6102108", true);
    // console.log(tx);

    // const ChonkSociety = await ethers.getContractFactory("ChonkSociety");
    // const chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
    // await chonkSociety.deployed();
    // console.log("address", chonkSociety.address);
    // const chonk = ChonkSociety.attach('0x0Cc14B1adcEd0804014449C18ddfF71a426a1bD0');
    // console.log(await chonk.ownerOf(1));
    // const tx = await chonk.connect(accounts[0]).mint('0xc8429C05315Ae47FFc0789A201E5F53E93D591D4', 10);
    // console.log(tx.hash)
    // const WXDC = await ethers.getContractFactory("WXDC");
    // const wXDC = await WXDC.attach("0x8cbace0bdd6e99bec44b8b5dbd0f30297aaf267b");
    // const tx = await wXDC.connect(accounts[0]).approve("0x603c668fd2dd8477b755f43c9ccac6a409684717", ethers.constants.MaxUint256);
    // console.log(tx);
    // const tx = await wXDC.mint(
    //     ["0xc8429C05315Ae47FFc0789A201E5F53E93D591D4", "0x4F9EF07A6DDF73494D2fF51A8f7B78e9c5815eb2", "0xbf4e57eA10b8D19Ad436293818469758145ee915"],
    //     ethers.utils.parseUnits("10")
    // );
    // console.log("tx", tx);

    // const tokenBoundAccount = "0xD865EeafB6D329777504D0980f40471e69FB4D8B";
    // const mockERC721 = "0x171cfc3407470336D8812286f8F498233A61A32f";
    // const TokenBoundAccountRegistry = await ethers.getContractFactory("TokenBoundAccountRegistry");
    // const registry = TokenBoundAccountRegistry.attach("0x915a122aA11d7C6F136Ed75ef33248f74aaf9Df8");
    // const tx = await registry.createAccount(tokenBoundAccount, "5555", mockERC721, 1, 200);
    // 0x174B3D4d3C8A2faA3b0d8e1a11c6f5866e9a72F2
    // const receipt = await tx.wait();
    // let args = receipt.events.find((ev) => ev.event === "AccountCreated").args;
    // let address = args[0];
    // console.log(address);

    // const LendingPool = await ethers.getContractFactory("LendingPoolV3");
    // const lendingPool = LendingPool.attach("0xeca64907285fe80732bba2f81d8810bafca77790");
    // const tx = await lendingPool.approve("0xe066cbdd13b9da906a72253360fa3264b39accf6", ethers.constants.MaxUint256);
    // console.log(tx)
    // console.log(await lendingPool.treasury());

    const WXDC = await ethers.getContractFactory("WXDC");
    const wXDC = WXDC.attach("0x8cbace0bdd6e99bec44b8b5dbd0f30297aaf267b");
    await wXDC.connect(accounts[0]).approve("0xeca64907285fe80732bba2f81d8810bafca77790", ethers.constants.MaxUint256);

    // // // const tx = await wXDC.allowance("0xeca64907285fe80732bba2f81d8810bafca77790", "0xe066cbdd13b9da906a72253360fa3264b39accf6");
    // const addresses = [
    //     "0xc6E90206BB76dCd2210B86827f7B63b9E24fF6aF",
    // ];

    // for (let i = 0; i < addresses.length; i++) {
    //     const tx = await wXDC.connect(accounts[0]).transfer(addresses[i], ethers.utils.parseUnits("50", 18));
    //     console.log(tx.hash);
    // }

    // console.log(tx);
    // console.log(await wXDC.balanceOf("0xbf4e57eA10b8D19Ad436293818469758145ee915"))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
