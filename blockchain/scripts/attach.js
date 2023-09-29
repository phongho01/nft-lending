const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    //* Get network */
    const accounts = await ethers.getSigners();

    //* Loading contract factory */
    // const PermittedNFTs = await ethers.getContractFactory("PermittedNFTs");
    // const permittedNFT = PermittedNFTs.attach("0xd3099dea9039148109ce65669960202f948b65fd");
    // console.log(await permittedNFT.getNFTPermit("0xf485b0f0140e416556b32a8390771baddb1561cd"));
    // const tx = await permittedNFT.connect(accounts[0]).setNFTPermit("0x0Cc14B1adcEd0804014449C18ddfF71a426a1bD0", true);
    // console.log(tx);

    // const DirectLoanFixedOffer = await ethers.getContractFactory("DirectLoanFixedOffer", {
    //     libraries: {
    //         LoanChecksAndCalculations: "0xba7c9198b40c014504f55549ef1a52f830a0e883",
    //         NFTfiSigningUtils: "0xd3099dea9039148109ce65669960202f948b65fd",
    //     },
    // });

    // const loan = DirectLoanFixedOffer.attach("0xDC53F5e44D1c723a7825F865AFA61eEA079066C1");

    // const offerData = {
    //     principalAmount: ethers.utils.parseUnits("10", 18),
    //     maximumRepaymentAmount: ethers.utils.parseUnits("10.2", 18),
    //     nftCollateralId: 1,
    //     nftCollateralContract: "0xf485b0f0140e416556b32a8390771baddb1561cd",
    //     duration: 2592000,
    //     adminFeeInBasisPoints: 25,
    //     erc20Denomination: "0xfea8b79984920f9d3b02207f17501015d1bdee60",
    // };
    // const signatureData = {
    //     signer: "0xc8429c05315ae47ffc0789a201e5f53e93d591d4",
    //     nonce: 7495481201976039,
    //     expiry: 1696501283,
    //     signature: "0x0ee6bb9d7d0b421f76310c6c0282a9f59b433519f4cdcdc70a90a1714b55034a31140b3ab6f88b8b279d3b0d4144740fb8fd4380b1413d4b46c5b1f382850c6d1c",
    // };

    // const offer = [ethers.utils.parseUnits("10", 18), ethers.utils.parseUnits("10.2", 18), 1, "0xf485b0f0140e416556b32a8390771baddb1561cd", 2592000, 25, "0xfea8b79984920f9d3b02207f17501015d1bdee60"];
    // const signature = [
    //     "0xc8429c05315ae47ffc0789a201e5f53e93d591d4",
    //     7495481201976039,
    //     1696501283,
    //     "0x0ee6bb9d7d0b421f76310c6c0282a9f59b433519f4cdcdc70a90a1714b55034a31140b3ab6f88b8b279d3b0d4144740fb8fd4380b1413d4b46c5b1f382850c6d1c",
    // ];

    // console.log(loan.functions);
    // console.log(await loan.getChainID());
    // const result = await loan.isValidLenderSignature(offerData, signatureData, "0x70a6bdbb3a42bc636668c4931fa06e82b97f9754");
    // console.log(result)
    // const hash = "0xbecf53043797e8af60f982f34047d7da0cba396a73be30172816d13ecf7a1608";
    // const offer = {
    //     principalAmount: "1000000000000000000",
    //     maximumRepaymentAmount: "1010000000000000000",
    //     nftCollateralId: 1,
    //     nftCollateralContract: "0xf485b0f0140e416556b32a8390771baddb1561cd",
    //     duration: 2592000,
    //     adminFeeInBasisPoints: 25,
    //     erc20Denomination: "0xfea8b79984920f9d3b02207f17501015d1bdee60",
    // };

    // const signature = {
    //     signer: "0xc8429c05315ae47ffc0789a201e5f53e93d591d4",
    //     nonce: 125069799796061,
    //     expiry: 1696495087,
    //     signature: "0x462933a275ff9ea90328804cdbbd0966b18a63485b5acf991ba892b91dce91df7e4002ded7060cad4dd895e3a273e1b3a0665d4b24280b6a19e094f1c612f3841c",
    // };

    // const tx = await loan.acceptOffer(hash, offer, signature);
    // console.log(tx.hash);

    // console.log(await loan.getERC20Permit("0xfea8b79984920f9d3b02207f17501015d1bdee60"))
    // console.log(await loan.loanIdToLoan(loanId));
    // const tx = await loan.payBackLoan(loanId);
    // console.log(tx)
    // const tx = await loan.connect(accounts[0]).setERC20Permit("0x747ae7Dcf3Ea10D242bd17bA5dfA034ca6102108", true);
    // console.log(tx);

    // const ChonkSociety = await ethers.getContractFactory("ChonkSociety");
    // const chonk = ChonkSociety.attach("0xf485b0f0140e416556b32a8390771baddb1561cd");
    // console.log(await chonk.getApproved(1));
    // const chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
    // await chonkSociety.deployed();
    // console.log("address", chonkSociety.address);
    // const chonk = ChonkSociety.attach('0x0Cc14B1adcEd0804014449C18ddfF71a426a1bD0');
    // console.log(await chonk.ownerOf(1));
    // const tx = await chonk.connect(accounts[0]).mint('0x6e471EEd9e30A2614B69801Ff2bb470f58682dAB', 6);
    // console.log(tx.hash)
    // console.log('accounts[0]', accounts[0].address)
    // const WXDC = await ethers.getContractFactory("WXDC");
    // const wXDC = WXDC.attach("0xfea8b79984920f9d3b02207f17501015d1bdee60");
    // const tx = await wXDC.connect(accounts[0]).transferFrom(accounts[0].address, "0x4F9EF07A6DDF73494D2fF51A8f7B78e9c5815eb2", ethers.utils.parseUnits("0.5", 18));
    // console.log(tx.hash)
    // console.log(await wXDC.allowance("0xc8429C05315Ae47FFc0789A201E5F53E93D591D4", "0x70a6bdbb3a42bc636668c4931fa06e82b97f9754"))
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
    // const tx = await lendingPool.approve("0x70a6bdbb3a42bc636668c4931fa06e82b97f9754", ethers.constants.MaxUint256);
    // console.log(tx)
    // console.log(await lendingPool.treasury());

    const WXDC = await ethers.getContractFactory("WXDC");
    // const wXDC = await WXDC.deploy();
    // console.log('wXDC', wXDC.address)
    // await wXDC.deployed();
    const wXDC = WXDC.attach("0xfea8b79984920f9d3b02207f17501015d1bdee60");
    const tx = await wXDC.connect(accounts[0]).approve("0x6db42573fa618f805982cac3f90179ae8acace28", ethers.constants.MaxUint256);
    console.log(tx.hash);
    // const tx = await wXDC.connect(accounts[0]).mint("0xf31a2e258bec65a46fb54cd808294ce215070150", ethers.utils.parseUnits("500", 18))
    // console.log(tx.hash)
    // const tx = await wXDC.allowance("0xeca64907285fe80732bba2f81d8810bafca77790", "0x70a6bdbb3a42bc636668c4931fa06e82b97f9754");
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
