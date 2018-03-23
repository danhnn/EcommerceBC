var EscrowEngine = artifacts.require("EscrowEngine");
var Escrow = artifacts.require("Escrow");

contract('EscrowEngine', async(accounts) => {
  let escrowEngineInstance;

  beforeEach('setup contract for each test', async function () {
    escrowEngineInstance = await EscrowEngine.deployed();
    await escrowEngineInstance.createContract(accounts[1],"Shoes ID HASH", {from: accounts[0], value: web3.toWei(1,"ether")});
  })

  it("...should store account0 as contract buyer.", async () => {
      let storeData = await escrowEngineInstance.getContractOfUser(accounts[0]);
      let escrowContract = Escrow.at(storeData[0]);
      let result = await escrowContract.buyer();
      assert.equal(accounts[0], result, "Wrong buyer");
  });
});
