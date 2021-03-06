<template>
  <v-app id="app" dark>
    <div>
    </div>
    <v-navigation-drawer fixed app permanent>
      <v-toolbar flat>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title">
              Outcome Trading Interface
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list dense class="pt-0">
        <v-list-tile @click="toggleContent(0)">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Orders</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="toggleContent(2)">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Outcomes</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="toggleContent(3)">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>WETH</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="toggleContent(4)">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Account</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile href="https://0xproject.com/portal/balances">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>0x token site</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-content>
      <v-alert type="error" :value="showWrongNetworkWindow">
        {{ errorMsg }}
      </v-alert>
      <v-container fill-height>
        <v-layout justify-center>
          <v-flex shrink>
            <div v-show="showOrderList == true">
              <OrderList :outcomeAddresses="outcomeAddresses" :outcomes="outcomes"></OrderList>
            </div>
            <div v-show="showOutcomeContent == true">
              <OutcomeContent v-on:update="updateOutcomes" :outcomesProp="outcomes" :outcomeAddresses="outcomeAddresses"></OutcomeContent>
            </div>
            <div v-show="showWETHContent == true">
              <GetWethContent :currentAccount="currentAccount"></GetWethContent>
            </div>
            <div v-show="showAccountContent == true">
              <AccountContent :outcomes="outcomes"></AccountContent>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import OutcomeToken from "@/js/outcometoken.js";
  import Voting from "@/js/voting.js";
  import GetWethContent from "@/components/GetWethContent.vue";
  import SetAllowance from "@/components/SetAllowance.vue";
  import OrderList from "@/components/OrderList.vue";
  import OutcomeContent from "@/components/OutcomeContent.vue";
  import AccountContent from "@/components/AccountContent.vue";
  import OutcomeList from "@/js/outcomelist.js";
  import {
    ZeroExError
  } from '0x.js/lib/src/types';
  import * as Web3ProviderEngine from "web3-provider-engine";
  import {
    InjectedWeb3Subprovider
  } from "@0xproject/subproviders";
  import * as RPCSubprovider from "web3-provider-engine/subproviders/rpc";
  import {
    Web3Wrapper
  } from "@0xproject/web3-wrapper";
  import {
    ZeroEx
  } from "0x.js";
  
  var content = {
    ORDER_LIST: 0,
    MAKE_ORDER: 1,
    ADD_OUTCOME: 2,
    GET_WETH: 3,
    ACCOUNT: 4
  };
  var voting = ["-", "Met", "Not met"]
  
  var providerEngine = new Web3ProviderEngine();
  providerEngine.addProvider(
    new InjectedWeb3Subprovider(window.web3.currentProvider)
  );
  providerEngine.addProvider(
    new RPCSubprovider({
      rpcUrl: "https://ropsten.infura.io"
    })
  );
  providerEngine.start();
  var zeroEx = new ZeroEx(providerEngine, {
    networkId: 3
  });
  
  
  export default {
    name: "dashboard",
    data() {
      return {
        msg: "Outcome Token Test DApp",
        outcomeName: "",
        backValue: undefined,
        showMakeOrder: false,
        showOrderList: false,
        showOutcomeContent: false,
        showWETHContent: false,
        outcomeAddresses: undefined,
        outcomeNames: undefined,
        outcomeAmounts: undefined,
        outcomes: [],
        showWrongNetworkWindow: false,
        errorMsg: undefined,
        showAccountContent: false,
        currentAccount: undefined
      };
    },
    beforeCreate: function() {
      let self = this;
      Voting.init()
      OutcomeToken.init()
      OutcomeList.init().then(function() {
        self.updateOutcomes()
      })
    },
    created: async function() {
      var self = this
      self.watchAccountUpdate().then(function() {
        if (self.currentAccount == undefined) {
          self.errorMsg = "Please log in to Metamask to use this DApp."
          self.showWrongNetworkWindow = true;
        } else {
          web3.eth.net.getId()
            .then(function(networkId) {
              switch (networkId) {
                case 3:
                  break
                default:
                  self.errorMsg = "This DApp is currently only supported on Ropsten testnet. Please connect to Ropsten through Metamask."
                  self.showWrongNetworkWindow = true
              }
            });
  
        }
      })
    },
    components: {
      SetAllowance,
      OrderList,
      GetWethContent,
      OutcomeContent,
      AccountContent
    },
    methods: {
      toggleContent: function(contentNbr) {
        var self = this;
        self.showOrderList = false;
        self.showMakeOrder = false;
        self.showOutcomeContent = false;
        self.showWETHContent = false;
        self.showAccountContent = false;
        switch (contentNbr) {
          case content.ORDER_LIST:
            self.showOrderList = true;
            break;
          case content.MAKE_ORDER:
            self.showMakeOrder = true;
            break;
          case content.ADD_OUTCOME:
            self.showOutcomeContent = true;
            break;
          case content.GET_WETH:
            self.showWETHContent = true;
            break;
          case content.ACCOUNT:
            self.showAccountContent = true
            break
        }
      },
  
      watchAccountUpdate: function() {
        let self = this
        window.setInterval(function() {
          window.web3.eth.getAccounts(function(err, accounts) {
            self.currentAccount = accounts[0]
          })
        }, 1000);
        return new Promise((resolve, reject) => {
          window.web3.eth.getAccounts(function(err, accounts) {
            self.currentAccount = accounts[0]
            resolve()
          })
        })
      },
  
      updateOutcomes: async function(filter) {
        let self = this;
        self.outcomes = [];
        self.outcomeAddresses = await OutcomeList.getOutcomeAddresses();
        self.outcomeNames = [];
        self.outcomeAmounts = [];
        let count = 0;
  
        self.outcomeAddresses.map(async(address) => {
          let name = await OutcomeToken.getName(address)
          let amount = await OutcomeToken.getAmount(address)
          let vote = await Voting.getVoteStatus(address)
         
          let allowance = await zeroEx.token.getProxyAllowanceAsync(address, self.currentAccount)
          let enabled = (allowance > 0) ? true : false;
          if (filter != undefined) {
            var filtered = await self.isFilteredOut(name, amount, vote, filter, address);
          }
          if ((filter == undefined) || !filtered) {
            self.outcomes.push({
              name: name,
              amount: amount,
              vote: voting[vote],
              enabled: enabled,
              address: address
            })
          }
          console.log(self.outcomes)
        });
      },
  
      isFilteredOut: async function(name, amount, vote, filter, address) {
        if (!name.toLowerCase().includes(filter.name.toLowerCase())) {
          return true
        }
        if ((filter.amount) && (amount == 0)) {
          return true
        }
        if (!(filter.metVote) && vote == 1) {
          return true
        }
        if (!(filter.notMetVote) && vote == 2) {
          return true
        }
        if (!(filter.unVoted) && vote == 0) {
          return true
        }
        let isOwner = await OutcomeToken.isOwner(address)
        if (!(filter.deployed) && isOwner) {
          return true
        }
        if (!(filter.deployedOthers) && !isOwner) {
          return true
        }
        return false
      }
    }
  };
</script>
