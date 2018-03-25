
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import EscrowEngine from '../../build/contracts/EscrowEngine.json'
import Escrow from '../../build/contracts/Escrow.json'
import getWeb3 from '../utils/getWeb3'
import SweetAlert from 'react-bootstrap-sweetalert';

class TransactionPage extends Component {

  state = {
    web3: null,
    products: [],
    isShowAlert: false,
    alertBoxType: 'success',
    alertBoxTitle: '',
    alertBoxContent: '',
    isBuyer: false,
    allContracts: [],
    confirmationContracts: [],
    finishContracts: [],

    isShowAlert: false,
    alertBoxType: 'success',
    alertBoxTitle: '',
    alertBoxContent: '',
  }

  componentWillMount() {
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

        const from = this.props.match.params.from;
        this.state.web3.eth.defaultAccount = from === "buyer" ? this.state.web3.eth.accounts[0] : this.state.web3.eth.accounts[1];
        this.setState({ isBuyer: from === "buyer" });
        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const escrow = contract(Escrow)
    const escrowEngine = contract(EscrowEngine);
    escrow.setProvider(this.state.web3.currentProvider)
    escrowEngine.setProvider(this.state.web3.currentProvider)
    this.setState({ escrow });
    // Declaring this for later so we can chain functions on SimpleStorage.
    // Get accounts.
    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const escrowEngineInstance = await escrowEngine.deployed();
      this.setState({ escrowEngineInstance });
      this.watchEvents();
      this.getAllTrans();
    })
  }

  resetState() {
    this.state.allContracts = [];
    this.state.confirmationContracts = [];
    this.state.finishContracts = [];
  }

  async getAllTrans() {
    this.resetState();

    let results;
    if (this.state.isBuyer) {
      console.log("GET BUYER TRANS")
      results = await this.state.escrowEngineInstance.getContractsOfBuyer(this.state.web3.eth.defaultAccount);

    } else {
      console.log("GET SELLER TRANS")
      results = await this.state.escrowEngineInstance.getContractsOfSeller(this.state.web3.eth.defaultAccount)
    }

    if (!results.error) {
      for (let i = 0; i < results.length; i++) {
        let escrow = this.state.escrow.at(results[i]);
        let desc = await escrow.description();
        let buyerOk = await escrow.buyerOk();
        let sellerOk = await escrow.sellerOk();
        let buyerReject = await escrow.buyerReject();
        let sellerReject = await escrow.sellerReject();
        let time = await escrow.time();
        let value = await escrow.value();

        this.state.allContracts.push({
          desc: this.state.web3.toAscii(desc).replace(/\0/g, ''), time: parseInt(time), buyerOk: parseInt(buyerOk), sellerOk: parseInt(sellerOk), buyerReject: parseInt(buyerReject), sellerReject: parseInt(sellerReject), value: this.state.web3.fromWei(parseInt(value), "ether"),
          escrowContract: escrow
        })
      }

      for (let i = 0; i < this.state.allContracts.length; i++) {
        let contract = this.state.allContracts[i];
        if (contract.buyerOk != 0 && contract.sellerOk != 0) {
          this.state.finishContracts.push({
            desc: contract.desc,
            time: contract.time,
            value: contract.value,
            status: 'completed'
          })
          continue;
        }
        if (contract.buyerReject != 0 || contract.sellerReject != 0) {
          this.state.finishContracts.push({
            desc: contract.desc,
            time: contract.time,
            value: contract.value,
            status: 'rejected'
          })
          continue;
        }
        if (contract.buyerOk == 0) {
          this.state.confirmationContracts.push({
            desc: contract.desc,
            time: contract.time,
            value: contract.value,
            escrowContract: contract.escrowContract
          })
          continue;
        }
      }

      this.setState({
        confirmationContracts: this.state.confirmationContracts,
        finishContracts: this.state.finishContracts
      })
    }

    console.log("all contract = ", this.state.allContracts)
    console.log("confimation contract = ", this.state.confirmationContracts)
    console.log("finish contract = ", this.state.finishContracts)
  }

  watchEvents() {

  }

  hideAlert() {
    this.setState({
      isShowAlert: false
    })
  }

  async onConfirm(p) {
    console.log("P = ", p);
    let result = await p.escrowContract.accept();
    if (!result.error) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'success',
        alertBoxTitle: 'Congratulation!',
        alertBoxContent: "The transaction complelted!",
      })
      this.getAllTrans();
    }else{
      console.log("accept error = ", result.error)
    }
  }

  async onReject(p) {
    let result = await p.escrowContract.reject();
    if (!result.error) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'warning',
        alertBoxTitle: 'Successful!',
        alertBoxContent: "The transaction was rejected!",
      })
      this.getAllTrans();
    }else{
      console.log("reject error = ", result.error)
    }
  }

  renderButtons(p) {
    if (this.state.isBuyer) {
      return (
        <div>
          <Button style={{ marginRight: 10 }} onClick={() => this.onConfirm(p)} variant="raised" color="primary" >
            Confirm
            </Button>
          <Button onClick={() => this.onReject(p)} variant="raised" color="secondary" >
            Reject
            </Button>
        </div>
      )
    }

    return(
      <div>
      <Button onClick={() => this.onReject(p)} variant="raised" color="secondary" >
            Reject
            </Button>
            </div>
    )
  }

  renderStatus(status) {
    if (status == "rejected") {
      return (
        <h6 style={{ color: 'red' }}>Rejected</h6>
      )
    }
    return (
      <h6 style={{ color: 'green' }}>Completed</h6>
    )
  }

  renderConfirmTransaction() {
    if (!this.state.escrowEngineInstance) {
      return null;
    }

    return this.state.confirmationContracts.map(p => {
      return (
        <div style={{ marginBottom: 10, }}>
          <p>Name: {p.desc}</p>
          <p>Price: {p.value} ether</p>
          <p>Time: {p.time}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 5, flexDirection: 'row'}}>
            {this.renderButtons(p)}
          </div>
          <p>--------------------</p>
        </div>
      )
    })
  }

  renderFinsihTransactions() {
    if (!this.state.escrowEngineInstance) {
      return null;
    }

    return this.state.finishContracts.map(p => {
      return (
        <div style={{ marginBottom: 10, }}>
          <p>Name: {p.desc}</p>
          <p>Price: {p.value} ether</p>
          <p>Time: {p.time}</p>
           {this.renderStatus(p.status)}
           <p>--------------------</p>
        </div>
      )
    })
  }

  render() {
    const from = this.props.match.params.from;
    return (
      <div style={{ marginLeft: 20 }}>
        <h3 style={{ color: 'red' }}>Transaction Page's {from}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', }}>
          <div style={{ marginRight: 50}}>
            <h3 style={{ color: '#167284'}}>Confirmation transactions:</h3>
            {this.renderConfirmTransaction()}
          </div>
          <div>
            <h3 style={{ color: 'green'}}>Completed transactions:</h3>
            {this.renderFinsihTransactions()}
          </div>
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

export default TransactionPage;
