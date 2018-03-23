var EscrowEngine = artifacts.require("EscrowEngine");
var Escrow = artifacts.require("Escrow");

contract('EscrowEngine', async (accounts) => {
  let escrowEngineInstance;
  let escrowContract;
  const seller = accounts[1];
  const buyer = accounts[0];
  const desc = "Shoes ID HASH";
  const valueBuy = 0.01; // Notice: value buy should large than gas! Cause if not, it will cause some unexpect for balance compare before and after

  beforeEach('setup contract for each test', async function () {
    escrowEngineInstance = await EscrowEngine.deployed();
    await escrowEngineInstance.createContract(seller, desc, { from: buyer, value: web3.toWei(valueBuy, "ether") });
    let storeData = await escrowEngineInstance.getContractOfUser(buyer);
    const latestContract = storeData[storeData.length - 1];
    escrowContract = Escrow.at(latestContract);
    console.log("Escrow Contract address = ", latestContract)
  })

  it("...should store right buyer.", async () => {
    let result = await escrowContract.buyer();
    assert.equal(buyer, result, "Wrong buyer");
  });

  it("...should store right seller.", async () => {
    let result = await escrowContract.seller();
    assert.equal(seller, result, "Wrong seller");
  });

  it("...should store right value.", async () => {
    let result = await escrowContract.value();
    assert.equal(valueBuy, web3.fromWei(result, "ether"), "Wrong value");
  });

  it("...should store right description.", async () => {
    let result = await escrowContract.description();
    assert.equal(desc, web3.toAscii(result).replace(/\0/g, ''), "Wrong description");
  });

  it("...should get right value when buyer accept", async () => {
    const balanceBefore = web3.fromWei(parseInt(web3.eth.getBalance(seller)),"ether");
    await escrowContract.accept();
    let result = await escrowContract.buyerOk();
    assert.notEqual(0, parseInt(result), "Wrong buyerOk");
 
    let balanceAfter = web3.fromWei(parseInt(web3.eth.getBalance(seller)),"ether");
    //const expectedResult = parseFloat(balanceBefore) + parseFloat(valueBuy);
    assert.isAbove(balanceAfter , balanceBefore, "Wrong seller balance");
  });

  it("...should get right value when buyerReject.", async () => {
    const balanceBefore = web3.fromWei(parseInt(web3.eth.getBalance(buyer)),"ether");
    await escrowContract.reject();
    let resultB = await escrowContract.buyerReject();
    assert.notEqual(0, parseInt(resultB), "Wrong buyerReject");
    let resultS = await escrowContract.sellerReject();
    assert.equal(0, parseInt(resultS), "Wrong sellerReject");
    
    let balanceAfter = web3.fromWei(parseInt(web3.eth.getBalance(buyer)),"ether");
    assert.isAbove(balanceAfter , balanceBefore, "Wrong buyer balance");
  });

  it("...should get right value when sellerReject.", async () => {
    const balanceBefore = web3.fromWei(parseInt(web3.eth.getBalance(buyer)),"ether");
    await escrowContract.reject({from: seller});
    let resultB = await escrowContract.buyerReject();
    assert.equal(0, parseInt(resultB), "Wrong buyerReject");
    let resultS = await escrowContract.sellerReject();
    assert.notEqual(0, parseInt(resultS), "Wrong sellerReject");
    
    let balanceAfter = web3.fromWei(parseInt(web3.eth.getBalance(buyer)),"ether");
    assert.isAbove(balanceAfter , balanceBefore, "Wrong buyer balance");
  });
});
