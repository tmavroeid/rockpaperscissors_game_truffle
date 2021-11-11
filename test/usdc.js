const USDC = artifacts.require("USDC");
const truffleAssert = require('truffle-assertions');

contract("USDC", async accounts => {
    var owner = accounts[0];
    var instance;

    beforeEach(async () => {
        instance = await USDC.new();

    });

    it("can add USDC name and symbol properly", async() => {
        assert.equal("USD Coin", await instance.name.call());
        assert.equal("USDC", await instance.symbol.call());
    });

    it("can get the decimals", async() => {
        let dec = await instance.decimals.call()
        assert.equal(dec,6, "Decimals should be 6");
    });

    it("can get the totalSupply", async() => {
        let totalSupply = await instance.totalSupply.call()
        assert.equal(Number(totalSupply),100000000000000000000000000, "Total supply should be 8000");
    });
    
    it("minting", async() => {
        // use account 1 since that account should have 0 
        let intial_balance = await instance.balanceOf(accounts[3]);
        // verify the balance is 0 USDC
        assert.equal(intial_balance.toNumber(), 0, "intial balance for account 1 should be 0");

        await instance.mint(accounts[3], 10);
        let after_balance = await instance.balanceOf(accounts[3]);
        assert.equal(after_balance.toNumber(), 10, "The balance after minting 100 should be 100");
    });

    it("minting to 0 address", async()=>{
        try {
            // Mint with address 0
            await instance.mint('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "USDC: mint to the zero address", "Failed minting on zero address");
        }
    });

    it("minting 0 amount of USDC", async()=>{
        instance = await USDC.deployed();
        try {
            await instance.mint(accounts[2], 0);
        }catch(error){
            assert.equal(error.reason, "USDC: mint 0 amount");
        }
    });

    it("burning", async() => {
        await instance.mint(accounts[1], 100);
        try {
            await instance.burn(accounts[1], 50);
        }catch(error){
            assert.fail(error);
        }
        let balance = await instance.balanceOf(accounts[1]);

        assert.equal(balance.toNumber(), 50, "Burning 50 should reduce users balance to 50");
    });

    it("burning to 0 address", async()=>{
        try{
            await instance.burn('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, "USDC: burn from the zero address", "Failed to notice burning on 0 address");
        }
    });

    it("burning more amount of USDC than the amount of balance", async()=>{
        try {
            await instance.burn(accounts[1], 10000);
        }catch(error){
            assert.equal(error.reason, "USDC: burn amount exceeds balance", "Failed to capture too big burns on an account");
        }
    });

    it("can transfer USDC from one account to another", async()=>{
        await instance.mint(accounts[5], 200);
        await instance.transfer(accounts[4],100, {from:accounts[5]});
        let balance = await instance.balanceOf(accounts[4]);
        assert.equal(balance.toNumber(), 100, "The amount of USDC should be 100");
    });

    it("cannot transfer more USDC from one account than existing", async()=>{
        await instance.mint(accounts[5], 200);
        try {
            await instance.transfer(accounts[4],300, {from:accounts[5]});
        }catch(error){
            assert.equal(error.reason, "USDC: tokens should be less/equal to the balance of the sender");
        }
    });
    

    it("can approve allowance for an account", async()=>{
        let result = await instance.approve(accounts[1],1000, {from: owner});
        truffleAssert.eventEmitted(result,"Approval");
    });

    it("can approve allowance for an account", async()=>{
        try {
           await instance.approve(accounts[2],1000, {from: accounts[1]});
        }catch(error){
            assert.equal(error.reason, "USDC: the amount of tokens to be allowed should more than the total balance");
        }
    });

    it("can transfer an amount of USDC on behalf of another account", async()=>{
        await instance.approve(accounts[1],1000, {from: owner});
        let result = await instance.transferFrom(owner,accounts[1], 1000,{from:accounts[1]});
        truffleAssert.eventEmitted(result, "Transfer");
    });

    it("cannot transfer an amount of USDC on behalf of another account that exceeds the allowance", async()=>{
        await instance.approve(accounts[1],1000, {from: owner});
        try {
            await instance.transferFrom(owner,accounts[1], 2000,{from:accounts[1]});
        }catch(error){
            assert.equal(error.reason, "The allowance should be more or equal to the tokens to be transfered");
        }        
    });

    it("can get allowance", async()=>{
        await instance.approve(accounts[1],1000, {from: owner});
        let result = await instance.allowance(accounts[1], {from: owner});
        assert.equal(result.toNumber(), 1000, "The allowed amount should be 1000");
    });

});