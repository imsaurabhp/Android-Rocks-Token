const { expect } = require("chai");
const { ethers } = require("hardhat");
const { string } = require("hardhat/internal/core/params/argumentTypes");


describe("AndroidRocksToken contract", function() {
  // global vars
  let token;
  let owner;
  let addr1;
  let addr2;
  const tokenCap = 100000000;
  const tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the Contract and Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await ethers.deployContract("AndroidRocksToken", [tokenCap, tokenBlockReward]);
    
  });
  
  describe("Deployment", function () {

    it("Should set the right owner", async function () {
        expect(await token.owner()).to.equal(owner.address);
    })

    it("Should assign the total supply of tokens to the owner", async function () {
        const ownerBalance = await token.balanceOf(owner.address);
        expect(await token.totalSupply()).to.equal(ownerBalance);
    })

    it("Should set the max capped supply to the argument provided during deployment", async function () {
        const cap = Number(ethers.formatEther(await token.cap()))
        expect(cap).to.equal(tokenCap)
    })

    it("Should set the blockReward to the argument provided during deployment", async function () {
        const blockReward = Number(ethers.formatEther(await token.blockReward()))
        expect(blockReward).to.equal(tokenBlockReward);
    })

  })

  describe("Transactions", function () {

    it("Should transfer tokens between accounts", async function () {
        // Transfer 50 tokens from owner to addr1
        const tx = await token.transfer(addr1.address, 50)
        // console.log(tx) 
        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await token.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await token.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
    })

    it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await token.balanceOf(owner.address);
        // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
        await expect(token.connect(addr1).transfer(owner.address, 1)).to.be.reverted
        // For somereasons, to.be.revertedWith("Error Msg") is not working

        // Owner balance shouldn't have changed.
        expect(await token.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
        );
    })

    it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await token.balanceOf(owner.address);

        // Transfer 100 tokens from owner to addr1.
        await token.transfer(addr1.address, 100);

        // Transfer another 50 tokens from owner to addr2.
        await token.transfer(addr2.address, 50);

        // Check balances.
        const finalOwnerBalance = await token.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));
        // for some reason initialOwnerBalance.sub(150) is not working

        const addr1Balance = await token.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);

        const addr2Balance = await token.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
    })
  })
  
});



// NOTES:
// 1. You wont find the value of tokens transacted in the transaction. In transaction.data you will get the token value represented in a hexadeciaml format.
    // data: '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000032'
    // 0xa9059cbb is the function selector for the transfer(address,uint256) function.
    // The following 64 characters (32 bytes in hexadecimal) represent the recipient address.
    // The next 64 characters represent the amount of tokens being transferred.
    // So, to decode the data field:

    // The recipient address is 0x70997970c51812dc3a010c7d01b50e0d17dc79c8.
    // The amount of tokens being transferred is 0x32 in hexadecimal, which is 50 in decimal.