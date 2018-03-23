pragma solidity ^0.4.18;

/*
EscrowEngine.deployed().then(function(i){ return i.createContract(web3.eth.accounts[1],"shoes") })

EscrowEngine.deployed().then(function(i){ return i.getContract();})
*/
contract EscrowEngine {
    address public escrowContractAddress;
    event EsscrowCreate(address newAddress);
    mapping(address => address[]) contractList;
    function EscrowEngine() {
        
    }

     function createContract(address _seller, bytes32 _description) public payable {
        escrowContractAddress = address((new Escrow).value(msg.value)(_seller, msg.sender, _description));
        contractList[msg.sender].push(escrowContractAddress);
        EsscrowCreate(escrowContractAddress);
    }

    function getContract() returns (address) {
      return escrowContractAddress;
    }
}

contract Escrow {
    address public buyer;
    address public seller;
    uint public time;
    uint public value;
    bytes32 public description;
    uint public buyerOk;
    uint public sellerOk;
    uint public buyerReject;
    uint public sellerReject;

    function Escrow(address _seller, address _buyer, bytes32 _description) payable {
      buyer = _buyer;
      seller = _seller;
      time =  block.timestamp;
      description = _description;
      value = this.balance;
      sellerOk = block.timestamp;    
    }
    
    function accept() {
      seller.transfer(value);
      buyerOk = block.timestamp;
    }

    function reject() {
      if (msg.sender == buyer) {
        buyerReject = block.timestamp;
      }else{
        sellerReject = block.timestamp;
      }
      buyer.transfer(value);
    }
}
