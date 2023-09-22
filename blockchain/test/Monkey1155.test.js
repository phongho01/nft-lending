const { ethers } = require("hardhat");
const { expect } = require("chai");
const { ZERO_ADDRESS } = require("../utils/test.utils");
const { contractFactoriesLoader, deployProxy } = require("../utils/deploy.utils");
require("dotenv").config();

const env = process.env;
const contractUri = "ipfs://";

describe("Monkey1155", () => {
    beforeEach(async () => {
        //** Get Wallets */
        [user1, user2, user3] = await ethers.getSigners();

        //** Get Contracts */
        const { Monkey1155 } = await contractFactoriesLoader();

        //** Deploy Contracts */
        monkey1155 = await deployProxy(Monkey1155, [
            contractUri,
            "Monkey 1155",
            "M1155"
        ]);

        expect(await monkey1155.contractURI()).to.equal(contractUri);
        expect(await monkey1155.name()).to.equal("Monkey 1155");
        expect(await monkey1155.symbol()).to.equal("M1155");
        expect(await monkey1155.lastId()).to.equal(0);
    });

    describe("setContractURI", () => {
        it("Should return exception `Invalid newUri`", async () => {
            const emptyUri = "";
            const newUri = "ipfs://.json"
            expect(await monkey1155.contractURI()).to.equal(contractUri);
            await expect(monkey1155.setContractURI(emptyUri)).to.revertedWith("Invalid newUri");
            await monkey1155.setContractURI(newUri);
            expect(await monkey1155.contractURI()).to.equal(newUri);
        });

        it("Should return success", async () => {
            const newUri = "ipfs://.json"
            expect(await monkey1155.contractURI()).to.equal(contractUri);
            await monkey1155.setContractURI(newUri);
            expect(await monkey1155.contractURI()).to.equal(newUri);
        });
    });

    describe("setTokenURI", () => {
        it("Should return exception `URI set of nonexistent token`", async () => {
            const tokenUri = "ipfs://pic.json";
            await expect(monkey1155.setTokenURI(0, tokenUri)).to.revertedWith(
                "URI set of nonexistent token"
            );

            await monkey1155.mint(user1.address, 100, tokenUri);
            const lastId = await monkey1155.lastId();
            expect(await monkey1155.uri(lastId)).to.equal(tokenUri);

            const newUri = "ipfs://pic123.json";
            await monkey1155.setTokenURI(lastId, newUri);
            expect(await monkey1155.uri(lastId)).to.equal(newUri);
        });

        it("Should return exception `Invalid tokenUri`", async () => {
            const tokenUri = "ipfs://pic.json";
            await monkey1155.mint(user1.address, 100, tokenUri);
            const lastId = await monkey1155.lastId();
            expect(await monkey1155.uri(lastId)).to.equal(tokenUri);

            const emptyUri = "";
            await expect(monkey1155.setTokenURI(lastId, emptyUri)).to.revertedWith("Invalid tokenUri");

            const newUri = "ipfs://pic123.json";
            await monkey1155.setTokenURI(lastId, newUri);
            expect(await monkey1155.uri(lastId)).to.equal(newUri);
        });

        it("Should return success", async () => {
            const tokenUri = "ipfs://pic.json";
            await monkey1155.mint(user1.address, 100, tokenUri);
            const lastId = await monkey1155.lastId();
            expect(await monkey1155.uri(lastId)).to.equal(tokenUri);

            const newUri = "ipfs://pic123.json";
            await monkey1155.setTokenURI(lastId, newUri);
            expect(await monkey1155.uri(lastId)).to.equal(newUri);
        });
    });

    describe("mint", () => {
        it("Should return exception `Invalid amount`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await expect(monkey1155.mint(user1.address, 0, tokenUri)).to.revertedWith(
                "Invalid amount"
            );
            await monkey1155.mint(user1.address, 100, tokenUri);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.uri(1)).to.equal(tokenUri);
        });

        it("Should return exception `Invalid tokenUri`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const emptyUri = "";
            await expect(monkey1155.mint(user1.address, 100, emptyUri)).to.revertedWith(
                "Invalid tokenUri"
            );

            const tokenUri = "ipfs://pic.json";
            await monkey1155.mint(user1.address, 100, tokenUri);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.uri(1)).to.equal(tokenUri);
        });

        it("Should return exception `ERC1155: mint to the zero address`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await expect(monkey1155.mint(ZERO_ADDRESS, 100, tokenUri)).to.revertedWith(
                "ERC1155: mint to the zero address"
            );

            await monkey1155.mint(user1.address, 100, tokenUri);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.uri(1)).to.equal(tokenUri);
        });

        it("Should return success", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await monkey1155.mint(user1.address, 100, tokenUri);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.uri(1)).to.equal(tokenUri);
        });
    });

    describe("mintBatch", () => {
        it("Should return exception `Invalid parameters`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await expect(
                monkey1155.mintBatch(user1.address, [100, 200], [tokenUri])
            ).to.revertedWith("Invalid parameters");

            await monkey1155.mintBatch(user1.address, [100, 200], [tokenUri, tokenUri]);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
        });

        it("Should return exception `Invalid amount`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await expect(monkey1155.mintBatch(user1.address, [0], [tokenUri])).to.revertedWith(
                "Invalid amount"
            );

            await monkey1155.mintBatch(user1.address, [100, 200], [tokenUri, tokenUri]);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
        });

        it("Should return exception `Invalid tokenUri`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const emptyUri = "";
            const tokenUri = "ipfs://pic.json";
            await expect(monkey1155.mintBatch(user1.address, [100], [emptyUri])).to.revertedWith(
                "Invalid tokenUri"
            );

            await monkey1155.mintBatch(user1.address, [100, 200], [tokenUri, tokenUri]);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.balanceOf(user1.address, 2)).to.equal(200);
        });

        it("Should return exception `ERC1155: mint to the zero address`", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);

            const tokenUri = "ipfs://pic.json";
            await expect(
                monkey1155.mintBatch(ZERO_ADDRESS, [100, 200], [tokenUri, tokenUri])
            ).to.revertedWith("ERC1155: mint to the zero address");

            await monkey1155.mintBatch(user1.address, [100, 200], [tokenUri, tokenUri]);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.balanceOf(user1.address, 2)).to.equal(200);
        });

        it("Should return success", async () => {
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(0);
            expect(await monkey1155.balanceOf(user1.address, 2)).to.equal(0);

            const tokenUri = "ipfs://pic.json";

            await monkey1155.mintBatch(user1.address, [100, 200], [tokenUri, tokenUri]);
            expect(await monkey1155.balanceOf(user1.address, 1)).to.equal(100);
            expect(await monkey1155.uri(1)).to.equal(tokenUri);
            expect(await monkey1155.balanceOf(user1.address, 2)).to.equal(200);
            expect(await monkey1155.uri(2)).to.equal(tokenUri);
        });
    });
});
