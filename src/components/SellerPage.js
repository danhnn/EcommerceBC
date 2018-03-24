
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import Store from '../../build/contracts/Store.json'
import EscrowEngine from '../../build/contracts/EscrowEngine.json'
import getWeb3 from '../utils/getWeb3'

class SellerPage extends Component {

  state = {
    web3: null,
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
        this.state.web3.eth.defaultAccount = this.state.web3.eth.accounts[1];
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
    store.setProvider(this.state.web3.currentProvider)
    // Declaring this for later so we can chain functions on SimpleStorage.
    // Get accounts.
    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const storeInstance = await store.deployed();
      this.state.storeInstance = storeInstance;

      //await storeInstance.addProduct("Shoes", "Sport", "IPFS_LINK", "Best shoes ever", this.state.web3.toWei(0.1, "ether"), { from: accounts[0], gas: 400000 });
    })
  }

  render() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', width: "100%", marginTop: 50, flexDirection: 'row' }}>
        <h1>Seller Page</h1>
      </div>
    )
  }

}


const styles = ({
  
});

export default SellerPage;
