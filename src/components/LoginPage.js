
import React, { Component } from 'react'
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

class LoginPage extends Component {

  onBuyerClick() {
    this.props.history.push("/buyer");
  }

  onSellerClick() {
    this.props.history.push("/seller");
  }

  render() {
    const { classes } = this.props;
 
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', width: "100%", marginTop: 100, flexDirection: 'row', justifyContent:'center' }}>
        <Button onClick={() => this.onBuyerClick()} variant="raised" color="primary" className={classes.button}>
        Buyer
      </Button>
      <Button onClick={() => this.onSellerClick()} variant="raised" color="secondary" className={classes.button}>
        Seller
      </Button>
      </div>
    )
  }

}


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

export default withStyles(styles)(LoginPage);
