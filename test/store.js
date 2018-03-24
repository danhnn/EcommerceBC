var Store = artifacts.require("./Store.sol");

contract('Store', async (accounts) => {
  let storeInstance;
  let seller = accounts[1];

  before('setup contract for all tests', async function () {
    storeInstance = await Store.deployed();
    storeInstance.addProduct("Shoes","Sport", "IPFS_LINK","Best shoes ever",web3.toWei(0.1,"ether"),{from: seller});
  })

  it("...should store right product.", async () => {
    let result = await storeInstance.getProduct(1);
    assert.equal(1, parseInt(result[0]), "Wrong ID");
    assert.equal("Shoes", result[1], "Wrong name");
    assert.equal("Sport", result[2], "Wrong category");
    assert.equal("IPFS_LINK", result[3], "Wrong image link");
    assert.equal("Best shoes ever", result[4], "Wrong description");
    assert.equal(0.1, web3.fromWei(result[5],"ether"), "Wrong value");
    assert.equal(seller, result[7], "Wrong seller address");
  });

  it("...should get right total quantity", async () => {
    await storeInstance.addProduct("Shoes2","Sport2", "IPFS_LINK","Best shoes ever",web3.toWei(0.1,"ether"));
    let result = await storeInstance.getTotalProduct();
    assert.equal(2, parseInt(result), "Wrong total quantity");
  });
  
});
