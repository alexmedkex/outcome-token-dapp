import contract from 'truffle-contract'
import OutcomeContract from '@contracts/OutcomeToken.json'

const OutcomeToken = {
    
    contract: null,
    init: function () {
        let self = this
        return new Promise(function (resolve, reject) {
            self.contract = contract(OutcomeContract)
            self.contract.setProvider(window.web3.currentProvider)
        })
    },

    back: function (address, _value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).back.sendTransaction({ from: window.web3.eth.coinbase, value: web3.toWei(_value, "ether"), gas: 2300000}).then(function(hash) {
                resolve(hash)
            })
        })
    },

    isOwner: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).isOwner.call(window.web3.eth.coinbase, { from: window.web3.eth.coinbase }).then(function(result) {
                console.log(result)
                resolve(result)
            })
        })
    },

    redeemBackerToken: function(address, value) {
        let self = this
        
        return new Promise((resolve, reject) => {
            console.log("backer token")
            self.contract.at(address).redeemBackerTokens.sendTransaction(web3.toWei(value, "ether"), { from: window.web3.eth.coinbase , gas: 2300000}).then(function(hash) {
                resolve(hash)
            })
        })
    },

    redeemRewardToken: function(address, value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).redeemRewardTokens(web3.toWei(value, "ether"), { from: window.web3.eth.coinbase, gas: 2300000 }).then(function() {
                resolve()
            })
        })
    },

    transferTokens: function(address, recipient, value) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).transfer(recipient, web3.toWei(value, "ether"), { from: window.web3.eth.coinbase, gas: 2300000 }).then(function() {
                resolve()
            })
        })
    },

    getName: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).getName().then(function(name) {
                resolve(name)
            }).catch(function() {
                resolve(address)
            })
        })
    },

    getAmount: function(address) {
        let self = this
        return new Promise((resolve, reject) => {
            self.contract.at(address).balanceOf(window.web3.eth.coinbase).then(function(amount) {
                resolve(amount)
            })
        })
    },

    deployNew: function (name, voting) {
        let self = this
        let contract = window.web3.eth.contract(OutcomeContract.abi)
        return new Promise((resolve, reject) => {
            contract.new(name, voting, "0x1e528859d160b4467a0963a2422037fa19087d02", { from: window.web3.eth.coinbase, data: OutcomeContract.bytecode, gas: 4400000, gasPrice: 100000000000 }, function(err, instance) {
                if(!instance.address) {
                    resolve(instance.transactionHash)
                } 
            })
        })
    }
}

export default OutcomeToken
