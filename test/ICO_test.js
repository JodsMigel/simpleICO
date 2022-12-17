const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");



describe("ICO test", function () {
    let owner
    let ico
    let token
    const provider = waffle.provider;
    const priceStage1 = 23809523809523809n;
    const priceStage2 = 47619047619047619n;
    const priceStage3 = 125000000000000000n;


    async function wait_time (amount) {
        const time = 86400 * amount; 
        await ethers.provider.send("evm_increaseTime", [time])
        await ethers.provider.send("evm_mine")
    }

    async function start () {
        await ico.startICO(token.address);
    }

    beforeEach(async function(){
        [owner] = await ethers.getSigners()
        const ICO = await ethers.getContractFactory("ICO", owner)
        ico = await ICO.deploy()
        await ico.deployed()
        const TOKEN = await ethers.getContractFactory("TokenTTT", owner)
        token = await TOKEN.deploy(ico.address)
        await token.deployed()
    })

    it("Can not buy before start and after of ICO", async function(){
        await expect(ico.buyToken(100)).to.be.revertedWith("ICO is not started");
        await start();
        await wait_time(50)
        await expect(ico.buyToken(100)).to.be.revertedWith("ICO is over");
    })
    
    it("Buy 100 token with on different stages", async function(){
        await start();
        await ico.buyToken(100, { value : priceStage1 * 100n});
        expect(await ico.balances(owner.address)).to.eq(100);
        expect(await provider.getBalance(ico.address)).to.eq(priceStage1 * 100n)
        await expect(ico.buyToken(100, { value : 999})).to.be.revertedWith("Incorrect amount of ETH");
        await wait_time(4);
        await ico.buyToken(100, { value : priceStage2 * 100n});
        expect(await provider.getBalance(ico.address)).to.eq((priceStage1 * 100n) + (priceStage2 * 100n))
        await expect(ico.buyToken(100, { value : 999})).to.be.revertedWith("Incorrect amount of ETH");
        expect(await ico.balances(owner.address)).to.eq(200);
        await wait_time(17);
        await ico.buyToken(100, { value : priceStage3 * 100n});
        await expect(ico.buyToken(100, { value : 999})).to.be.revertedWith("Incorrect amount of ETH");
        expect(await ico.balances(owner.address)).to.eq(300);
        expect(await provider.getBalance(ico.address)).to.eq((priceStage1 * 100n) + (priceStage2 * 100n) + (priceStage3 * 100n))
    })

    it("Only users in WL can withdraw tokens before ICO end", async function(){
        await start();
        await ico.buyToken(100, { value : priceStage1 * 100n});
        await expect(ico.payOut(100)).to.be.revertedWith("Before end of ICO only whitelisted users can withdraw");
        await ico.addToWhiteList(owner.address);
        await ico.payOut(100)
    })

    it("Can not withdraw more than have", async function(){
        await start();
        await ico.buyToken(100, { value : priceStage1 * 100n});
        await wait_time(50);
        await expect(ico.payOut(200)).to.be.revertedWith("balance insufficient");
    })

    it("Correct amount to withdraw", async function(){
        await start();
        await ico.buyToken(100, { value : priceStage1 * 100n});
        await wait_time(50);
        await ico.payOut(100);
        expect(await ico.balances(owner.address)).to.eq(0);
        expect(await token.balanceOf(owner.address)).to.eq(ethers.utils.parseEther("100"));
    })

    
    it("Add and remove to/from WL correctly", async function(){
        expect(await ico.whitelist(owner.address)).to.eq(false);
        await expect(ico.removeFromWhiteList(owner.address)).to.be.revertedWith("Already not in whitelist");
        await ico.addToWhiteList(owner.address);
        await expect(ico.addToWhiteList(owner.address)).to.be.revertedWith("Already in whitelist");
        expect(await ico.whitelist(owner.address)).to.eq(true);
        await ico.removeFromWhiteList(owner.address);
        expect(await ico.whitelist(owner.address)).to.eq(false);
    })

});


//await network.provider.send("evm_increaseTime", [3600])
//it("just test", async function(){})

//const owner_balance = await provider.getBalance(owner.address)
//const acc1_balance = await provider.getBalance(acc1.address);
//const ico_balance = await provider.getBalance(ico.address);