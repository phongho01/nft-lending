const { ethers } = require("hardhat");
const { getRandomInt, getEncodeOffer, getEncodedSignature, getMessage, getTimestamp, skipTime, ZERO_ADDRESS, MAX_UINT256 } = require("./utils");
const { expect } = require("chai");

let directLoanFixedOffer;
let chonkSociety;
let permittedNFTs;
let wXDC;
let deployer;
let lender;
let borrower;
let accounts;

let offer;
let signature;
let loanId;

const TOKEN_1 = ethers.utils.parseUnits("1", 18);
let ONE_DAY = 24 * 60 * 60;

const LoanStatus = {
    ACTIVE: 0,
    REPAID: 1,
    LIQUIDATED: 2,
};

describe("Loan", () => {
    beforeEach(async () => {
        [deployer, lender, borrower, treasury, ...accounts] = await ethers.getSigners();

        const PermittedNFTs = await ethers.getContractFactory("PermittedNFTs");
        const LoanChecksAndCalculations = await hre.ethers.getContractFactory("LoanChecksAndCalculations");
        const NFTfiSigningUtils = await hre.ethers.getContractFactory("NFTfiSigningUtils");
        const LiquidateNFTPool = await ethers.getContractFactory("LiquidateNFTPool");
        const LendingPool = await ethers.getContractFactory("LendingPoolV3");
        const WXDC = await ethers.getContractFactory("WXDC");

        let liquidateNFTPool = await LiquidateNFTPool.deploy(deployer.address);
        await liquidateNFTPool.deployed();

        let loanChecksAndCalculations = await LoanChecksAndCalculations.deploy();
        await loanChecksAndCalculations.deployed();

        let nftfiSigningUtils = await NFTfiSigningUtils.deploy();
        await nftfiSigningUtils.deployed();

        wXDC = await WXDC.deploy();
        await wXDC.deployed();

        const lendingPool = await LendingPool.deploy(wXDC.address, treasury.address, "10000000000000000000", 0);
        await lendingPool.deployed();

        permittedNFTs = await PermittedNFTs.deploy(deployer.address);
        await permittedNFTs.deployed();

        const DirectLoanFixedOffer = await ethers.getContractFactory("DirectLoanFixedOffer", {
            libraries: {
                LoanChecksAndCalculations: loanChecksAndCalculations.address,
                NFTfiSigningUtils: nftfiSigningUtils.address,
            },
        });

        directLoanFixedOffer = await DirectLoanFixedOffer.deploy(deployer.address, lendingPool.address, liquidateNFTPool.address, permittedNFTs.address, [wXDC.address]);
        await directLoanFixedOffer.deployed();

        // const ChonkSociety = await ethers.getContractFactory("ChonkSociety");
        // chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
        // await chonkSociety.deployed();

        // // early transaction
        // await permittedNFTs.connect(deployer).setNFTPermit(chonkSociety.address, true);
        // await chonkSociety.connect(borrower).mint(borrower.address, 10);
        // await wXDC.connect(lender).mint(lender.address, TOKEN_1.mul(100));
        // await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(100));

        // await wXDC.connect(borrower).mint(lendingPool.address, TOKEN_1.mul(100));
        // await wXDC.mint(liquidateNFTPool.address, TOKEN_1.mul(1000));
        // await lendingPool.approve(directLoanFixedOffer.address, ethers.constants.MaxUint256);
    });

    describe("acceptOffer", () => {
        it("should revert with currency denomination is not permitted", async () => {
            offer.erc20Denomination = ZERO_ADDRESS;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Currency denomination is not permitted");

            const WXDC = await ethers.getContractFactory("WXDC");
            const newWXDC = await WXDC.deploy();
            await newWXDC.deployed();
            offer.erc20Denomination = newWXDC.address;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Currency denomination is not permitted");
        });

        it("should revert with NFT collateral contract is not permitted", async () => {
            offer.nftCollateralContract = ZERO_ADDRESS;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("NFT collateral contract is not permitted");

            const ChonkSociety = await ethers.getContractFactory("ChonkSociety");
            const chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
            await chonkSociety.deployed();
            offer.nftCollateralContract = chonkSociety.address;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("NFT collateral contract is not permitted");
        });

        it("should revert with loan duration exceeds maximum loan duration", async () => {
            offer.duration = ONE_DAY * 7 * 53 + 1;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Loan duration exceeds maximum loan duration");
        });

        it("should revert with loan duration cannot be zero", async () => {
            offer.duration = 0;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Loan duration cannot be zero");
        });

        it("should revert with the admin fee has changed since this order was signed.", async () => {
            offer.adminFeeInBasisPoints = 24;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("The admin fee has changed since this order was signed.");

            offer.adminFeeInBasisPoints = 26;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("The admin fee has changed since this order was signed.");
        });

        it("should revert with negative interest rate loans are not allowed.", async () => {
            offer.maximumRepaymentAmount = offer.principalAmount.sub(1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Negative interest rate loans are not allowed.");

            offer.principalAmount = offer.maximumRepaymentAmount.add(1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Negative interest rate loans are not allowed.");
        });

        it("should revert with lender nonce invalid", async () => {
            const signature = {
                nonce: 123123,
                expiry: 1689786000,
                signer: lender.address,
            };

            const encodeSignature = getEncodedSignature(signature);

            const encodeOffer = getEncodeOffer(offer);

            const message = getMessage(encodeOffer, encodeSignature, directLoanFixedOffer.address, 31337);
            const provider = ethers.provider;
            const signer = provider.getSigner(lender.address);
            signature.signature = await signer.signMessage(message);

            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, TOKEN_1.mul(100));

            const loanId = "0xebe4fe30af161bb8b26d55867c264d98c256cbfe364c00ea2cb779d1233d67f1";
            await directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender nonce invalid");
        });

        it("should revert with lender signature is invalid", async () => {
            offer.principalAmount = TOKEN_1.mul(15).sub(1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            offer.maximumRepaymentAmount = offer.maximumRepaymentAmount.sub(1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            offer.nftCollateralId = 2;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            const ChonkSociety = await ethers.getContractFactory("ChonkSociety");
            const chonkSociety = await ChonkSociety.deploy("https://chonksociety.s3.us-east-2.amazonaws.com/metadata/");
            await chonkSociety.deployed();
            await permittedNFTs.connect(deployer).setNFTPermit(chonkSociety.address, true);

            offer.nftCollateralContract = chonkSociety.address;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            offer.duration = 11;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            const WXDC = await ethers.getContractFactory("WXDC");
            const newWXDC = await WXDC.deploy();
            await newWXDC.deployed();
            offer.erc20Denomination = newWXDC.address;
            await directLoanFixedOffer.connect(deployer).setERC20Permit(newWXDC.address, true);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            signature.nonce = getRandomInt();
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            signature.expiry = 1689786001;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");

            signature.signer = accounts[0].address;
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("Lender signature is invalid");
        });

        it("should revert with invalid token id", async () => {
            offer.nftCollateralId = 123;
            const encodeSignature = getEncodedSignature(signature);
            const encodeOffer = getEncodeOffer(offer);

            const message = getMessage(encodeOffer, encodeSignature, directLoanFixedOffer.address, 31337);
            const provider = ethers.provider;
            const signer = provider.getSigner(lender.address);
            signature.signature = await signer.signMessage(message);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC721: invalid token ID");
        });

        it("should revert with caller is not token owner or approved", async () => {
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC721: caller is not token owner or approved");

            await chonkSociety.connect(borrower).transferFrom(borrower.address, accounts[0].address, 1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC721: caller is not token owner or approved");
        });

        it("should revert with insufficient allowance", async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC20: insufficient allowance");

            await wXDC.connect(lender).approve(directLoanFixedOffer.address, TOKEN_1.mul(15).sub(1));
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC20: insufficient allowance");
        });

        it("should revert with transfer amount exceeds balance", async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).transfer(accounts[0].address, TOKEN_1.mul(85).add(1));
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, TOKEN_1.mul(15));
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature)).to.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("should accept offer successfully", async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, MAX_UINT256);
            await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature))
                .to.emit(directLoanFixedOffer, "LoanStarted")
                .to.changeTokenBalances(wXDC, [lender.address, borrower.address], [TOKEN_1.mul(-15), TOKEN_1.mul(15)])
                .to.changeTokenBalances(chonkSociety, [directLoanFixedOffer.address, borrower.address], [1, -1]);
            expect(await chonkSociety.ownerOf(1)).to.equal(directLoanFixedOffer.address);

            const loan = await directLoanFixedOffer.loanIdToLoan(loanId);
            expect(loan.principalAmount).to.equal(TOKEN_1.mul(15));
            expect(loan.maximumRepaymentAmount).to.equal(TOKEN_1.mul(18));
            expect(loan.nftCollateralId).to.equal(1);
            expect(loan.erc20Denomination).to.equal(wXDC.address);
            expect(loan.duration).to.equal(10);
            expect(loan.adminFeeInBasisPoints).to.equal(25);
            expect(loan.loanStartTime).to.closeTo(await getTimestamp(), 10);
            expect(loan.nftCollateralContract).to.equal(chonkSociety.address);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.lender).to.equal(lender.address);
            expect(loan.status).to.equal(LoanStatus.ACTIVE);
        });
    });

    describe("payBackLoan", () => {
        beforeEach(async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, MAX_UINT256);
            await directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature);
        });

        it("should revert with insufficient allowance", async () => {
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(18));

            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("ERC20: insufficient allowance");
        });

        it("should revert with loan already repaid", async () => {
            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(18));
            await directLoanFixedOffer.connect(borrower).payBackLoan(loanId);

            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("Loan already repaid/liquidated");
        });

        it("should revert with loan already liquidated", async () => {
            await skipTime(ONE_DAY * 10 + 1);
            await directLoanFixedOffer.connect(lender).liquidateOverdueLoan(loanId);

            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("Loan already repaid/liquidated");
        });

        it("should revert with loan is expired", async () => {
            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(18));

            await skipTime(ONE_DAY);
            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("Loan is expired");
        });

        it("should revert with insufficient allowance", async () => {
            // await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(18));

            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("ERC20: insufficient allowance");

            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, TOKEN_1.mul(18).sub(1));
            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("ERC20: insufficient allowance");
        });

        it("should revert with transfer amount exceeds balance", async () => {
            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("ERC20: transfer amount exceeds balance");

            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(3).sub(1));
            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId)).to.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("should payBackLoan successfully", async () => {
            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(3));

            const royaltyFee = TOKEN_1.mul(18).mul(25).div(10000);
            const lenderFee = TOKEN_1.mul(18).sub(royaltyFee);

            await expect(directLoanFixedOffer.connect(borrower).payBackLoan(loanId))
                .to.emit(directLoanFixedOffer, "LoanRepaid")
                .to.changeTokenBalances(wXDC, [deployer.address, lender.address, borrower.address], [royaltyFee, lenderFee, TOKEN_1.mul(18)])
                .to.changeTokenBalances(chonkSociety, [directLoanFixedOffer.address, borrower.address], [-1, 1]);
        });
    });

    describe("liquidateOverdueLoan", () => {
        beforeEach(async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, MAX_UINT256);
            await directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offer, signature);
        });

        it("should revert with invalid loan id", async () => {
            await expect(directLoanFixedOffer.connect(lender).liquidateOverdueLoan(loanId + 1)).to.be.reverted;
            await expect(directLoanFixedOffer.connect(lender).liquidateOverdueLoan(1)).to.be.reverted;

            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, MAX_UINT256);
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(3));
            await directLoanFixedOffer.connect(borrower).payBackLoan(loanId);

            await expect(directLoanFixedOffer.connect(lender).liquidateOverdueLoan(1)).to.be.reverted;
        });

        it("should revert with loan is not overdue yet", async () => {
            await expect(directLoanFixedOffer.connect(lender).liquidateOverdueLoan(loanId)).to.revertedWith("Loan is not overdue yet");
        });

        it("should revert with only lender can liquidate", async () => {
            await skipTime(ONE_DAY);
            await expect(directLoanFixedOffer.connect(deployer).liquidateOverdueLoan(loanId)).to.revertedWith("Only lender can liquidate");
            await expect(directLoanFixedOffer.connect(borrower).liquidateOverdueLoan(loanId)).to.revertedWith("Only lender can liquidate");
        });

        it("should liquidateOverdueLoan successfully", async () => {
            await skipTime(ONE_DAY);
            await expect(directLoanFixedOffer.connect(lender).liquidateOverdueLoan(loanId))
                .to.emit(directLoanFixedOffer, "LoanLiquidated")
                .to.changeTokenBalances(chonkSociety, [directLoanFixedOffer.address, lender.address], [-1, 1]);
        });

        it("", async () => {
            const loanId = "0xe2156a8c0df2c909cdb8363fe05203381d9b0c9e24dbfc15ee53f741268b0078";
            const offer = {
                principalAmount: {
                    type: "BigNumber",
                    hex: "0x8ac7230489e80000",
                },
                maximumRepaymentAmount: {
                    type: "BigNumber",
                    hex: "0x8ef0f36da2860000",
                },
                nftCollateralId: 4,
                nftCollateralContract: "0xf31a2e258bec65a46fb54cd808294ce215070150",
                duration: 2592000,
                adminFeeInBasisPoints: 25,
                erc20Denomination: "0x747ae7Dcf3Ea10D242bd17bA5dfA034ca6102108",
            };
            const signature = [
                {
                    signer: "0xbf4e57ea10b8d19ad436293818469758145ee915",
                    nonce: 8235433715756225,
                    expiry: 53944393777,
                    signature: "0x8fe2e9e2b051e2d01b2596d09c316f4c63caafc5408e9752a4fa58eac9338b25133e81b6265f200196d2c07466c15619a6edad4c12f0aa8deb42e0732a5876941b",
                },
                {
                    signer: "0x601d06fd394b4e74037f51e13b0b6fc9e6a2c7df",
                    nonce: 3098022932000833,
                    expiry: 53944393792,
                    signature: "0xe4c168f37fd389f4ceff3879f699c0a13707488d0a784cbbbe44826ee57a0f567b25b06732963ba094a8353a2d9bf7da2c6d253ff52df235a092dee2fad92e181c",
                },
                {
                    signer: "0x475dadd02b62698b8a3ce58dfbf5b05168a7a1db",
                    nonce: 119440082829873,
                    expiry: 53944393785,
                    signature: "0x5464184b4378c65ea1758cd422af03191072f6c438fa321b1246e6aa3714106f4021214825dd6a6a80fae9863d0df4618eb4a83d93ec17047167a8e68e98f9911c",
                },
            ];
        });

        it("test pay back", async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, TOKEN_1.mul(100));

            const offer = {
                principalAmount: TOKEN_1.mul(15),
                maximumRepaymentAmount: TOKEN_1.mul(18),
                nftCollateralId: 1,
                nftCollateralContract: chonkSociety.address,
                duration: ONE_DAY * 30,
                adminFeeInBasisPoints: 25,
                erc20Denomination: wXDC.address,
            };

            const encodeOffer = getEncodeOffer(offer);

            const signature = {
                nonce: getRandomInt(),
                expiry: 1689699600,
                signer: lender.address,
            };

            const encodeSignature = getEncodedSignature(signature);

            const message = getMessage(encodeOffer, encodeSignature, directLoanFixedOffer.address, 31337);
            const provider = ethers.provider;
            const signer = provider.getSigner(lender.address);
            // console.log("test message", ethers.utils.hashMessage(message));
            signature.signature = await signer.signMessage(message);

            // const signerAddress = ethers.utils.verifyMessage(ethers.utils.hashMessage(message), signature.signature);
            const loanId = "0xebe4fe30af161bb8b26d55867c264d98c256cbfe364c00ea2cb779d1233d67c9";
            await directLoanFixedOffer.connect(borrower).acceptOfferLendingPool(loanId, offer, [signature, signature, signature]);

            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, TOKEN_1.mul(100));
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(3));

            await directLoanFixedOffer.connect(borrower).payBackLoan(loanId);
            console.log(await chonkSociety.ownerOf(1), borrower.address);
        });

        it("test liquidateNFT", async () => {
            await chonkSociety.connect(borrower).approve(directLoanFixedOffer.address, 1);
            await wXDC.connect(lender).approve(directLoanFixedOffer.address, TOKEN_1.mul(100));

            const offer = {
                principalAmount: TOKEN_1.mul(15),
                maximumRepaymentAmount: TOKEN_1.mul(18),
                nftCollateralId: 1,
                nftCollateralContract: chonkSociety.address,
                duration: 60,
                adminFeeInBasisPoints: 25,
                erc20Denomination: wXDC.address,
            };

            const encodeOffer = getEncodeOffer(offer);

            const signature = {
                nonce: getRandomInt(),
                expiry: Number(await getCurrentTimestamp()) + 60,
                signer: lender.address,
            };

            const encodeSignature = getEncodedSignature(signature);

            const message = getMessage(encodeOffer, encodeSignature, directLoanFixedOffer.address, 31337);
            const provider = ethers.provider;
            const signer = provider.getSigner(lender.address);
            // console.log("test message", ethers.utils.hashMessage(message));
            signature.signature = await signer.signMessage(message);

            // const signerAddress = ethers.utils.verifyMessage(ethers.utils.hashMessage(message), signature.signature);
            const loanId = "0xebe4fe30af161bb8b26d55867c264d98c256cbfe364c00ea2cb779d1233d67c9";
            await directLoanFixedOffer.connect(borrower).acceptOfferLendingPool(loanId, offer, [signature, signature, signature]);

            await wXDC.connect(borrower).approve(directLoanFixedOffer.address, TOKEN_1.mul(100));
            await wXDC.connect(borrower).mint(borrower.address, TOKEN_1.mul(3));

            await skipTime(60);

            await directLoanFixedOffer.connect(borrower).liquidateOverdueLoan(loanId);
            console.log(await chonkSociety.ownerOf(1), liquidateNFTPool.address);
        });
    });

    it.only("test", async () => {
        const loanId = "0xa8874b77690e710ec2a86b3ea9ab84456a9092dbfb2d9ba8cedcd6ce140e2006";
        const offerData = {
            principalAmount: ethers.utils.parseUnits("10", 18),
            maximumRepaymentAmount: ethers.utils.parseUnits("10.2", 18),
            nftCollateralId: 1,
            nftCollateralContract: "0xf485b0f0140e416556b32a8390771baddb1561cd",
            duration: 2592000,
            adminFeeInBasisPoints: 25,
            erc20Denomination: "0xfea8b79984920f9d3b02207f17501015d1bdee60",
        };
        const signatureData = {
            signer: "0xc8429c05315ae47ffc0789a201e5f53e93d591d4",
            nonce: 7495481201976039,
            expiry: 1696501283,
            signature: "0x0ee6bb9d7d0b421f76310c6c0282a9f59b433519f4cdcdc70a90a1714b55034a31140b3ab6f88b8b279d3b0d4144740fb8fd4380b1413d4b46c5b1f382850c6d1c",
        };
        await directLoanFixedOffer.setERC20Permits(["0xfea8b79984920f9d3b02207f17501015d1bdee60"], [true]);
        await permittedNFTs.connect(deployer).setNFTPermit("0xf485b0f0140e416556b32a8390771baddb1561cd", true);
        await expect(directLoanFixedOffer.connect(borrower).acceptOffer(loanId, offerData, signatureData)).to.revertedWith("Currency denomination is not permitted");

        const { offer, repayment, nftTokenId, nftAddress, duration, adminFeeInBasisPoints = 25, erc20Denomination = WXDC_ADDRESS } = offerData;
        const encodedOffer = ethers.utils.solidityPack(
            ["address", "uint256", "uint256", "address", "uint256", "uint32", "uint16"],
            [erc20Denomination, offer, repayment, nftAddress, nftTokenId, duration, adminFeeInBasisPoints]
        );

        const { signer: signerAddress, nonce, expiry } = signatureData;

        const encodedSignature = ethers.utils.solidityPack(["address", "uint256", "uint256"], [signerAddress, nonce, expiry]);
        console.log("encodedOffer", encodedOffer);
        console.log("encodedSignature", encodedSignature);
    });
});
