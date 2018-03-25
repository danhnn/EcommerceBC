
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import ListProducts from './ListProducts'
import Store from '../../build/contracts/Store.json'
import EscrowEngine from '../../build/contracts/EscrowEngine.json'
import getWeb3 from '../utils/getWeb3'

class BuyerPage extends Component {
  state = {
    web3: null,
    products: [],
  }

  constructor(props) {
    super(props)
  }


  componentWillMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })
        this.state.web3.eth.defaultAccount = this.state.web3.eth.accounts[0];
        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const store = contract(Store)
    const escrowEngine = contract(EscrowEngine);
    store.setProvider(this.state.web3.currentProvider)
    escrowEngine.setProvider(this.state.web3.currentProvider)
    // Declaring this for later so we can chain functions on SimpleStorage.
    // Get accounts.
    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const storeInstance = await store.deployed();
      this.state.storeInstance = storeInstance;
      const escrowEngineInstance = await escrowEngine.deployed();
      this.setState({escrowEngineInstance});

      //await storeInstance.addProduct("Shoes", "Sport", "IPFS_LINK", "Best shoes ever", this.state.web3.toWei(0.1, "ether"), { from: accounts[0], gas: 400000 });
      this.getAllProduct();
    })
  }

  async getAllProduct() {
    let products = [];
    let result = await this.state.storeInstance.getTotalProduct();
    const productCount = parseInt(result);
    for (let i = 1; i <= productCount; i++) {
      const p = await this.state.storeInstance.getProduct(i);
      products.push(p);
    }
    this.setState({ products })
  }

  onBuyPress(p) {
    this.state.escrowEngineInstance.createContract(p[7], p[0], { from: this.state.web3.defaulAccount, value: this.state.web3.toWei(p[5], "ether") });
  }

  renderAddress() {
    if (this.state.web3) {
      return this.state.web3.eth.defaultAccount;
    }

    return "unindentify"
  }

  render() {
    return (
      <div style={{ marginLeft:30 }}>
        <h3>Buyer Page </h3>
        <p>Address: {this.renderAddress()}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, flexDirection: 'row' }}>

          <ListProducts web3={this.state.web3} onBuyPress={(p) => this.onBuyPress(p)} products={this.state.products} />
        </div>
      </div>
    )
  }

}


const styles = ({

});

export default BuyerPage;
