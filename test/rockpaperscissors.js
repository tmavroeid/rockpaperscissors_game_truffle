const RockPaperScissors = artifacts.require("RockPaperScissors");
const USDC = artifacts.require("USDC");

const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract("RockPaperScissors", async accounts => {
    var owner = accounts[0];
    var instance;
    var usdc_instance;

    beforeEach(async () => {
        usdc_instance = await USDC.new();
        instance = await RockPaperScissors.new(usdc_instance.address);
    });

    it("can create RockPaperScissors contract", async() => {
        assert.equal(owner, await instance.owner(),"The owner of RockPaperScissors contract should be the owner address");
    });

    it("can make deposits of USDC", async() => {
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        let balance_after = await usdc_instance.balanceOf(accounts[1])
        assert.equal(balance_after.toNumber(), 1000,"the balance should be 1000 less due to deposit");
    });
    
    it("cannot deposit 0 USDC", async() => {
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,0, {from: accounts[1]})
        try{
            await instance.deposit(0,{from:accounts[1]});
        }catch(error){
            assert.equal(error.reason, "USDC tokens should be more than zero");
        }
    });

    it("cannot deposit more USDC than approved", async() => {
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        try{
            await instance.deposit(2000,{from:accounts[1]})
        }catch(error){
            assert.equal(error.reason, "The bet amount should be less than total USDC balance");
        }
    });

    it("can start a game", async() => {
        let result = await instance.startGame(accounts[2],'This is a secret game my friend', 5, {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'Started');
    });

    it("can playerOne make a choice", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 5, {from: accounts[1]})
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        let result = await instance.playerOnePlay(1, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'PlayerOnePlayed');
    });

    it("can playerTwo make a choice", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(1, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        let result = await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        truffleAssert.eventEmitted(result, 'PlayerTwoPlayed');
    });

    it("can declare winner", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(2, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        let result = await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'Completed', (ev) => {
            return ev.winnerAddress === accounts[1] && ev.choice.toNumber() === 2;
        });
    });

    it("can declare tie", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(1, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        let result = await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'Tie', (ev) => {
            return ev.playerAddressOne === accounts[1] && ev.playerAddressTwo === accounts[2];
        });
    });

    it("can declare winner", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(2, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        let result = await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'Completed', (ev) => {
            return ev.winnerAddress === accounts[1] && ev.choice.toNumber() === 2;
        });
    });

    it("cannot declare winner if called from non player", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(2, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        let result = await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[3]})
        truffleAssert.eventEmitted(result, 'Completed', (ev) => {
            return ev.winnerAddress === accounts[1] && ev.choice.toNumber() === 2;
        });
    });

    it("can withdraw prize", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(2, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[1]})
        let result = await instance.withdrawPrize('This is a secret game my friend', {from: accounts[1]})
        truffleAssert.eventEmitted(result, 'Withdrawed');
    });

    it("cannot withdraw prize if not winner", async() => {
        await instance.startGame(accounts[2],'This is a secret game my friend', 3600, {from: accounts[1]})
        await usdc_instance.mint(accounts[2],2000)
        await usdc_instance.mint(accounts[1],2000)
        //approval is required in order to make the deposit
        await usdc_instance.approve(instance.address,1000, {from: accounts[2]})
        await instance.deposit(1000,{from:accounts[2]})
        await usdc_instance.approve(instance.address,1000, {from: accounts[1]})
        await instance.deposit(1000,{from:accounts[1]})
        await instance.playerOnePlay(2, accounts[2], 'This is a secret game my friend', {from: accounts[1]})
        await instance.playerTwoPlay(1, accounts[1], 'This is a secret game my friend', {from: accounts[2]})
        await instance.declareWinner('This is a secret game my friend', accounts[2], {from: accounts[1]})
        try {
            await instance.withdrawPrize('This is a secret game my friend', {from: accounts[2]});
        }catch(error){
            assert.equal(error.reason, "You have to win to withdraw the prize");
        }       
    });
});