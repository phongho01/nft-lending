const { ethers } = require("hardhat");
const { expect } = require("chai");
const { ZERO_ADDRESS, genNumbersASC, checkIsOwnerOfTokenIds, checkTokenURIs } = require("../utils/test.utils");
const { contractFactoriesLoader, deployProxy } = require("../utils/deploy.utils");
require("dotenv").config();

const env = process.env;
const contractUri = "https://ipfs";

describe("Monkey721", () => {
    beforeEach(async () => {
        //** Get Wallets */
        [user1, user2, user3] = await ethers.getSigners();

        //** Get Contracts */
        const { Monkey721 } = await contractFactoriesLoader();

        //** Deploy Contracts normal */
        monkey721 = await deployProxy(Monkey721, [
            contractUri,
            "Monkey 721",
            "M721"
        ]);

        expect(await monkey721.contractURI()).to.equal(contractUri);
        expect(await monkey721.name()).to.equal("Monkey 721");
        expect(await monkey721.symbol()).to.equal("M721");
        expect(await monkey721.lastId()).to.equal(0);
    });

    describe("setContractURI", () => {
        it("Should return exception `Invalid newUri`", async () => {
            const emptyUri = "";
            const newUri = "ipfs://new.json";
            expect(await monkey721.contractURI()).to.equal(contractUri);
            await expect(monkey721.setContractURI(emptyUri)).to.revertedWith("Invalid newUri");
            await monkey721.setContractURI(newUri);
            expect(await monkey721.contractURI()).to.equal(newUri);
        });

        it("Should return success", async () => {
            const newUri = "ipfs://new.json";
            expect(await monkey721.contractURI()).to.equal(contractUri);
            await monkey721.setContractURI(newUri);
            expect(await monkey721.contractURI()).to.equal(newUri);
        });
    });

    describe("setTokenURI", () => {
        it("Should return exception `URI set of nonexistent token`", async () => {
            let tokenUri = "ipfs//:pic.json";
            let tokenId = await monkey721.lastId();
            await expect(monkey721.setTokenURI(tokenId, tokenUri)).to.revertedWith(
                "URI set of nonexistent token"
            );

            await monkey721.mint(user1.address, tokenUri);
            tokenId = await monkey721.lastId();

            expect(await monkey721.ownerOf(tokenId)).to.equal(user1.address);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);

            await monkey721.setTokenURI(tokenId, tokenUri);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);
        });

        it("Should return exception `Invalid tokenUri`", async () => {
            const emptyUri = "";
            const tokenUri = "ipfs//:pic.json";

            await monkey721.mint(user1.address, tokenUri);
            const tokenId = await monkey721.lastId();
            expect(await monkey721.ownerOf(tokenId)).to.equal(user1.address);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);

            await expect(monkey721.setTokenURI(tokenId, emptyUri)).to.revertedWith("Invalid tokenUri");

            await monkey721.setTokenURI(tokenId, tokenUri);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);
        });

        it("Should return success", async () => {
            const tokenUri = "ipfs//:pic.json";
            await monkey721.mint(user1.address, tokenUri);
            const tokenId = await monkey721.lastId();

            expect(await monkey721.ownerOf(tokenId)).to.equal(user1.address);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);

            await monkey721.setTokenURI(tokenId, tokenUri);
            expect(await monkey721.tokenURI(tokenId)).to.equal(tokenUri);
        });
    });

    describe("mint", async () => {
        it("Should return exception `Invalid tokenUri`", async () => {
            expect(await monkey721.balanceOf(user1.address)).to.equal(0);

            const emptyUri = "";
            const tokenUri = "ipfs//:pic.json";

            await expect(monkey721.mint(user1.address, emptyUri)).to.revertedWith(
                "Invalid tokenUri"
            );

            await monkey721.mint(user1.address, tokenUri);
            expect(await monkey721.balanceOf(user1.address)).to.equal(1);
            expect(await monkey721.ownerOf(await monkey721.lastId())).to.equal(user1.address);
            expect(await monkey721.tokenURI(await monkey721.lastId())).to.equal(tokenUri);
        });

        it("Should return exception `ERC721: mint to the zero address`", async () => {
            const tokenUri = "ipfs//:pic.json";
            await expect(monkey721.mint(ZERO_ADDRESS, tokenUri)).to.revertedWith(
                "ERC721: mint to the zero address"
            );

            expect(await monkey721.balanceOf(user1.address)).to.equal(0);
            await monkey721.mint(user1.address, tokenUri);
            expect(await monkey721.balanceOf(user1.address)).to.equal(1);
            expect(await monkey721.ownerOf(await monkey721.lastId())).to.equal(user1.address);
            expect(await monkey721.tokenURI(await monkey721.lastId())).to.equal(tokenUri);
        });

        it("Should return success", async () => {
            const tokenUri = "ipfs//:pic.json";
            expect(await monkey721.balanceOf(user1.address)).to.equal(0);

            await monkey721.mint(user1.address, tokenUri);
            expect(await monkey721.balanceOf(user1.address)).to.equal(1);
            expect(await monkey721.ownerOf(await monkey721.lastId())).to.equal(user1.address);
            expect(await monkey721.tokenURI(await monkey721.lastId())).to.equal(tokenUri);
        });
    });

    describe("mintBatch", async () => {
        it("Should return exception `Invalid tokenUri`", async () => {
            expect(await monkey721.balanceOf(user1.address)).to.equal(0);

            const emptyUri = "";
            const tokenUri1 = "ipfs//:pic1.json";
            const tokenUri2 = "ipfs//:pic2.json";
            await expect(
                monkey721.mintBatch(user1.address, [emptyUri, tokenUri2])
            ).to.revertedWith("Invalid tokenUri");

            await monkey721.mintBatch(user1.address, [tokenUri1, tokenUri2]);
            expect(await monkey721.balanceOf(user1.address)).to.equal(2);
            await checkIsOwnerOfTokenIds(monkey721, [1, 2], Array(2).fill(user1.address));
            await checkTokenURIs(monkey721, [1, 2], [tokenUri1, tokenUri2]);
        });

        it("Should return exception `ERC721: mint to the zero address`", async () => {
            expect(await monkey721.balanceOf(user1.address)).to.equal(0);

            const tokenUri = "ipfs//:pic.json";
            await expect(monkey721.mintBatch(ZERO_ADDRESS, [tokenUri, tokenUri])).to.revertedWith(
                "ERC721: mint to the zero address"
            );
            await monkey721.mintBatch(user1.address, Array(5).fill(tokenUri));
            expect(await monkey721.balanceOf(user1.address)).to.equal(5);
            await checkIsOwnerOfTokenIds(monkey721, genNumbersASC(1, 5), Array(5).fill(user1.address));
            await checkTokenURIs(monkey721, genNumbersASC(1, 5), Array(5).fill(tokenUri));
        });

        it("Should return success", async () => {
            expect(await monkey721.balanceOf(user1.address)).to.equal(0);

            const tokenUri = "ipfs//:pic.json";
            await monkey721.mintBatch(user1.address, Array(5).fill(tokenUri));
            expect(await monkey721.balanceOf(user1.address)).to.equal(5);
            await checkIsOwnerOfTokenIds(monkey721, genNumbersASC(1, 5), Array(5).fill(user1.address));
            await checkTokenURIs(monkey721, genNumbersASC(1, 5), Array(5).fill(tokenUri));
        });
    });
});
