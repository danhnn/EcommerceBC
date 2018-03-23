pragma solidity ^0.4.18;

contract Store {

  enum ProductStatus { Sold, Unsold, Buying}
  uint public productIndex;
  mapping (address => mapping(uint => Product)) stores;
  mapping (uint => address) productIdInStore;

  struct Product {
    uint id;
    string name;
    string category;
    string imageLink;
    string description;
    uint price;
    ProductStatus status;
  }

  function Store() {
    productIndex = 0;
  }

  function addProduct(string _name, string _category, string _imageLink, string _description, uint _price) {
    productIndex += 1;
    Product memory product = Product(productIndex, _name, _category, _imageLink, _description, _price, ProductStatus.Unsold);
    stores[msg.sender][productIndex] = product;
    productIdInStore[productIndex] = msg.sender;
  }

  function getProduct(uint _productId) view public returns (uint, string, string, string, string, uint, ProductStatus) {
    Product memory product = stores[productIdInStore[_productId]][_productId];
    return (product.id,product.name,product.category,product.imageLink, product.description, product.price, product.status);
  }
}