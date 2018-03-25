
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import ListProducts from './ListProducts'
import Store from '../../build/contracts/Store.json'
import EscrowEngine from '../../build/contracts/EscrowEngine.json'
import getWeb3 from '../utils/getWeb3'
import SweetAlert from 'react-bootstrap-sweetalert';

class BuyerPage extends Component {
  state = {
    web3: null,
    products: [],
    isShowAlert: false,
    alertBoxType: 'success',
    alertBoxTitle: '',
    alertBoxContent: '',
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
      this.setState({ escrowEngineInstance });
      this.watchEvents();
      this.getAllProduct();
    })
  }

  watchEvents = () => {
    let eventAdded = this.state.storeInstance.ProductAdded();
    eventAdded.watch(async (error, result) => {
      if (!error) {
        const pid = result.args.value.toString();
        const p = await this.state.storeInstance.getProduct(pid);
        this.setState({
          products: [...this.state.products, p]
        })
      }
    });
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

  hideAlert() {
    this.setState({
      isShowAlert: false
    })
  }

  onBuyPress = async (p) => {
    let result = await this.state.escrowEngineInstance.createContract(p[7], p[1], { from: this.state.web3.eth.defaultAccount, gas: 4000000, value: p[5] });
    if (!result.error) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'success',
        alertBoxTitle: 'Successful!',
        alertBoxContent: "Escrow contract has been created! Please check your transaction history!",
      })
    } else {
      console.log("buy error = ", result.error);
    }
  }

  onTransactionClick() {
    this.props.history.push("/transaction/buyer");
  }

  renderAddress() {
    if (this.state.web3) {
      return this.state.web3.eth.defaultAccount;
    }

    return "unindentify"
  }

  renderBalance() {
    if (!this.state.web3 || !this.state.web3.eth.defaultAccount) {
      return 0;
    }

    const balance = this.state.web3.fromWei(parseInt(this.state.web3.eth.getBalance(this.state.web3.eth.defaultAccount)), "ether");
    console.log("Balance ", balance)
    return balance;
  }

  render() {
    return (
      <div style={{ marginLeft: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <h2 style={{ color: 'green' }}>Buyer Page </h2>  
          <Button style={{ height: 45 }} onClick={() => this.onTransactionClick()} variant="raised" color="primary" >
            Transaction Page
         </Button>
        </div>
        <p>Address: {this.renderAddress()}</p>
        <p>Balance: {this.renderBalance()} ether</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10, flexDirection: 'row' }}>

          <ListProducts web3={this.state.web3} onBuyPress={(p) => this.onBuyPress(p)} products={this.state.products} />
        </div>

        <SweetAlert style={{ width: 250, marginLeft: 200, marginTop: -150 }} show={this.state.isShowAlert} type={this.state.alertBoxType} title={this.state.alertBoxTitle} onConfirm={() => { this.hideAlert() }}>
          {this.state.alertBoxContent}
        </SweetAlert>
      </div>
    )
  }

}


const styles = ({

});

export default BuyerPage;
