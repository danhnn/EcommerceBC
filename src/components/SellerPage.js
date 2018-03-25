
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import Store from '../../build/contracts/Store.json'
import EscrowEngine from '../../build/contracts/EscrowEngine.json'
import getWeb3 from '../utils/getWeb3'
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import SweetAlert from 'react-bootstrap-sweetalert';

const ipfsApi = require('ipfs-api');
const ethUtil = require('ethereumjs-util');

const ipfs = ipfsApi({ host: 'localhost', port: '5001', protocol: 'http' });
class SellerPage extends Component {

  state = {
    web3: null,
    name: '',
    category: '',
    imageLink: '',
    description: '',
    value: 0,

    isShowAlert: false,
    alertBoxType: 'success',
    alertBoxTitle: '',
    alertBoxContent: '',
  }

  constructor(props) {
    super(props)
  }


  hideAlert() {
    this.setState({
      isShowAlert: false
    })
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

    this.state.web3.eth.getAccounts(async (error, accounts) => {
      const storeInstance = await store.deployed();
      this.setState({ storeInstance });
      //await storeInstance.addProduct("Shoes", "Sport", "IPFS_LINK", "Best shoes ever", this.state.web3.toWei(0.1, "ether"), { from: accounts[0], gas: 400000 });
    })
  }

  renderAddress() {
    if (this.state.web3) {
      return this.state.web3.eth.defaultAccount;
    }

    return "unindentify"
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file);

    let readerBuffer = new FileReader();
    readerBuffer.readAsArrayBuffer(file);
    reader.onload = () => {
      var arrayBuffer = reader.result
      this.setState({
        arrayBuffer: arrayBuffer
      });
    };
  }

  onSaveProduct() {
    (async () => {
      await this.saveProduct();
    })();
  }

  async saveProduct() {
    console.log(1)
    let res = await this.saveImageOnIpfs();
    console.log(2)
    this.state.imageLink = res[0].hash;
    console.log("Final state = ", this.state);

    let response = await this.state.storeInstance.addProduct(this.state.name, this.state.category, this.state.imageLink, this.state.description, this.state.web3.toWei(parseFloat(this.state.value), "ether"), { gas: 800000 });
    if (!response.error) {
      this.setState({
        isShowAlert: true,
        alertBoxType: 'success',
        alertBoxTitle: 'Well done!',
        alertBoxContent: "Product has just been added to blockchain!",
      })
    }
  }

  saveImageOnIpfs() {
    const buffer = Buffer.from(this.state.arrayBuffer);
    return ipfs.add(buffer);
  }

  render() {
    const { classes } = this.props;

    return (
      <div style={{ marginLeft: 30 }}>
        <h3>Seller Page</h3>
        <p>Address: {this.renderAddress()}</p>
        <h4 style={{ color: 'red' }}>Add product:</h4>

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <input className={classes.fileInput}
              type="file"
              onChange={(e) => this._handleImageChange(e)} />

            <TextField
              id="name"
              label="Name"
              className={classes.textField}
              value={this.state.name}
              onChange={(event) => { this.setState({ name: event.target.value }) }}
              margin="normal"
            />
            <TextField
              id="category"
              label="Category"
              className={classes.textField}
              value={this.state.category}
              onChange={(event) => { this.setState({ category: event.target.value }) }}
              margin="normal"
            />

            <TextField
              id="description"
              label="Description"
              className={classes.textField}
              value={this.state.description}
              onChange={(event) => { this.setState({ description: event.target.value }) }}
              margin="normal"
            />
            <TextField
              id="value"
              label="Value"
              className={classes.textField}
              value={this.state.value}
              onChange={(event) => { this.setState({ value: event.target.value }) }}
              margin="normal"
            />
          </div>

          <img style={{ width: "100%", padding: 20 }} src={this.state.imagePreviewUrl} />
        </div>

        <Button onClick={() => this.onSaveProduct()} variant="raised" color="primary" className={classes.button}>
          Add
      </Button>

        <SweetAlert style={{ width: 250, marginLeft: 200, marginTop: -100 }} show={this.state.isShowAlert} type={this.state.alertBoxType} title={this.state.alertBoxTitle} onConfirm={() => { this.hideAlert() }}>
          {this.state.alertBoxContent}
        </SweetAlert>
      </div>
    )
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  button: {
    marginTop: 10,
    marginLeft: 10,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  fileInput: {
    borderBottom: '4px solid lightgray',
    padding: 10,
    marginLeft: 10,
    width: 180,
    cursor: 'pointer',
  }
});

export default withStyles(styles)(SellerPage);
