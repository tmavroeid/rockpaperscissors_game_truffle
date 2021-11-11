const RockPaperScissors = artifacts.require("RockPaperScissors");
const USDC = artifacts.require("USDC");

module.exports = async function(deployer) {
  await deployer.deploy(USDC);
  const token = await USDC.deployed();
  await deployer.deploy(RockPaperScissors, token.address);
};
