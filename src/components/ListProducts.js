
import React, { Component } from 'react'
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import shoes from '../../shoes.jpg';

class ListProducts extends Component {

  renderListProducts() {
    if (this.props.products.length == 0) {
      return;
    }

    return this.props.products.map(p => {
      return this.renderProduct(p);
    })
  }

  render() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', width: "100%", flexDirection: 'row' }}>
        {this.renderListProducts()}
      </div>
    )
  }

  onBuyPress(p) {
    this.props.onBuyPress(p);
  }

  renderProduct(p) {
    const { classes } = this.props;

    return (
      <div key={p[0]}>
        <Card className={classes.card}>
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography component="h6">{p[1]}</Typography>
              <Typography color="primary" variant="caption" component="h6">
                {parseFloat(this.props.web3.fromWei(p[5], "ether"))} ether
              </Typography>
              <Typography component="h6" variant="caption">
                -- {p[2]} --
              </Typography>
              <Typography component="p" variant="caption">
                {p[4]}
              </Typography>

              <Button onClick={() => this.onBuyPress(p)} size="small" color="primary">
                Buy
              </Button>
            </CardContent>
          </div>
          <CardMedia
            className={classes.cover}
            image={'http://localhost:8080/ipfs/'+ p[3]}
          />
        </Card>
      </div>
    )
  }
}

ListProducts.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = ({
  card: {
    display: 'flex',
    width: 250,
    justifyContent: 'space-between',
    marginRight: 20,
    marginBottom: 10
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto'
  },
  cover: {
    width: 100,
    height: 90,
    margin: 10
  },
});

export default withStyles(styles)(ListProducts);
