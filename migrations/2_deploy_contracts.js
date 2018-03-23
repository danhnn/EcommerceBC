var Store = artifacts.require("./Store.sol");
var EscrowEngine = artifacts.require("EscrowEngine");

module.exports = function(deployer) {
  deployer.deploy(Store);
  deployer.deploy(EscrowEngine);
};

