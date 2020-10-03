let cart = {
  data: function() {
      return {
        prices: {
            "device": 249,
            "subscription": 10
        },
        page: 0,
        devicesNumber: 0,
        addresses: [],
        cards: [],
        cardSelected: 0,
        modalInputs: [
          {"name": "name", "label": "Name", "maxlength": 50},
          {"name": "country", "label": "Country", "maxlength": 30},
          {"name": "city", "label": "City", "maxlength": 30},
          {"name": "address", "label": "Address", "maxlength": 100},
          {"name": "complement", "label": "Complement", "maxlength": 100},
          {"name": "postal_code", "label": "Postal code", "maxlength": 5}
        ]
      }
  },

  components: {container, warning},
  
  props: {data: {default: void 0}},
  
  methods: {
      handleChanges: function() {
          $("#number").on("change", (event) => {
              $("#numberSpan").text(event.target.value);
              $("#devicesPrice").text(event.target.value * this.prices.device);
              $("#subscriptionPrice").text(event.target.value * this.prices.subscription);
              this.devicesNumber = event.target.value;
          });
      },
      buy: function() {
        if (this.devicesNumber < 1) return;
        this.page = 1;
        $("#card").ready(() => {
          card.mount('#card');
        });
      },

      pay: function() {
        let data = {};
        data['headers'] = cred.methods.get_headers();
        data['data'] = {
          "order": {
            "devicesNumber": this.devicesNumber,
            "price": {
              "amount": this.totalPrice,
              "currency": "Eur",
            },
            "addresses": {
              "billingId": this.orderInfos.billingAddress.id,
              "shippingId": this.orderInfos.shippingAddress.id
            }
          }
        };
        user.methods.send('ordertoken', data, this.order);
      },

      order: function(res) {
        let data = {};
        data['headers'] = cred.methods.get_headers();
        data['data'] = {
          "crd_token": this.orderInfos.card.crd_token,
          "cmd_token": res
        };
        user.methods.send('order', data, this.storeCharge);
      },

      storeCharge: function(data) {
        if (data != '') {
          this.order_id = data['order_id'];
          vm.$refs.extern.set("Order successfully completed", "succes");
          setTimeout(() => {
            location.reload();
          }, 4000);
        }
      },

      getAddresses: function() {
        let headers = cred.methods.get_headers()
        user.methods.retrieve('listaddresses', headers, this.storeAddresses);
      },
      addAddress: function() {
        let data = {};
        data['headers'] = cred.methods.get_headers();
        data['data'] = {};
        let address = {};
        $('[name^="address_"]').each((index, elem) => {
          let name = $(elem).attr("name").replace("address_", "");
          address[name] = $(elem).val();
        });
        data['data']['address'] = address;
        
        user.methods.send('addaddress', data, this.getAddresses);
        $('[name^="address_"]').each((index, elem) => {
          $(elem).val("");
        });
      },
      storeAddresses: function(data){
        if (data != '') {
          this.addresses = data['addresses'];
        }
      },
      deleteaddress: function (id) {
        let data = {}
        data['headers'] = cred.methods.get_headers()
        data['data'] = {
          'address_id': id,
        }
        user.methods.send('deladdress', data, this.getAddresses);
      },

      getCreditCards: function() {
        let headers = cred.methods.get_headers()
        user.methods.retrieve('listcard', headers, this.storeCreditCards);
      },
      addCreditCard: function() {
        this.stripe.createToken(card).then((result) => {
          if (result.error) {
            self.hasCardErrors = true;
            return;
          }
          if (result.token != void 0) {
            let data = {}
            data['headers'] = cred.methods.get_headers();
            data['data'] = {
              'crd_token': result.token.id
            }
            user.methods.send('addcard', data, this.getCreditCards);
          }
        });
      },
      storeCreditCards: function(data) {
        if (data != '') {
          this.cards = data['cards'];
        }
      },
      deletecard: function (crd_token) {
        let data = {}
        data['headers'] = cred.methods.get_headers()
        data['data'] = {
          'crd_token': crd_token,
        }
        user.methods.send('delcard', data, this.getCreditCards);
      },
      select: function(id) {
        $("#" + id).find("input").click();
      },
      showOrderHistory: function() {
        let billing = $('[name="billingaddress"]:checked').val();
        let shipping = $('[name="shippingaddress"]:checked').val();
        let cardVal = $('[name="card"]:checked').val();
        if (!billing || !shipping || !cardVal) {
          user.methods.error("All fields are required");
          return;
        }
        this.orderInfos = {
          "billingAddress": JSON.parse(billing),
          "shippingAddress": JSON.parse(shipping),
          "card": JSON.parse(cardVal),
        };
        this.totalPrice = this.devicesNumber * (this.prices.device + this.prices.subscription);
        this.page = 2;
      }
  },
  
  mounted(){
    this.stripe = Stripe(`pk_test_51HNFqIG0ojBoDfME0Evors7Kcf5WwPG5ldVASvXaD6rV5rKIF8yrLD6HElonTZecBBItfGihuXkogGiqivSWRkLe00sxJDtgEA`);
    elements = this.stripe.elements();
    style = {
      base: {
        border: '1px solid #D8D8D8',
        borderRadius: '4px',
        color: "#000",
      }
    };
    card = elements.create('card', style);
    this.handleChanges();
    this.getAddresses();
    this.getCreditCards();
  },
  
  template: `
            <div class="main">
              <div class="hidden" style="">
              </div>
              <div class="usualcenter infos">
                <div class="container">
                  <div class="row">
                    <div class="col-lg-12">
                      <h1 class="txt-lt">Cart</h1>
                    </div>
                  </div>
                  <br>
                  <div v-if="page == 0" class="marge" style="height: inherit;">
                    <container note="Your cart"
                      name="My cart"
                      hover=false
                      style="height: 100%">
                      <div class="row justify-content-md-center">
                          <label class="col-md-4">Number of devices</label>
                          <input id="number" type="range" class="custom-range col-md-6" min="0" max="10" value="0">
                          <span id="numberSpan" class="col-md-2">0</span>
                      </div>
                      <br>
                      <span>249€ / device + 10€ / month / device</span>
                      <br><br>
                      <span><span id="devicesPrice">0</span>€ now + <span id="subscriptionPrice">0</span>€ / month</span>
                      <br><br>
                      <div id="buyButton" style="width:160px" class="wc-button" v-if="devicesNumber > 0" v-on:click=buy>Buy</div>
                    </container>
                  </div>
                  <div v-if="page == 1" class="col-md-12 marge" style="height: inherit;">
                    <div class="row">
                      <div class="col-lg-6 col-md-12">
                      <container note="Choose or add a billing address"
                        name="Billing address"
                        hover=false
                        border=true
                        style="margin-top: 20px;">
                        <span v-if="addresses.length < 1">You don't have any address yet, please add one</span>
                        <br/>
                        <div v-if="addresses.length > 0" class="col-12">
                          <div class="col-sm-12 col-12 margin5px" for="input2">{{ addresses.length > 1 ? "Your address" : "Your addresses" }}</div>
                          </br>
                          <div class="col-md-1 hidesms"></div>
                          <ul class='list-group col-12  modalelist'>
                            <li :id="'billing_' + address.id" v-for="address in addresses" class="list-group-item list-group-item-action" v-on:click="select('billing_' + address.id)">
                              <div class="row ml-1">
                                <input class="mr-3 ml-0" type="radio" name="billingaddress" :value="JSON.stringify(address)"/>
                                <div style="text-align: left">{{ address.name }}</div>
                                <div class="ml-auto mr-0" style="text-align: right">{{ address.city }}</div>
                                <div class="ml-3 mr-3" style="text-align: right"><div class="deletecard cross" v-on:click="deleteaddress(address.id)">╳</div></div>
                              </div>
                            </li>
                          </ul>
                          </br>
                        </div>
                        <div style="width:auto" class="wc-button" data-toggle="modal" data-target="#addressModal">Add a new address</div>
                      </container>
                      </div>
                      <div class="col-lg-6 col-md-12">
                      <container note="Choose or add a shipping address"
                        name="Shipping address"
                        hover=false
                        border=true
                        style="margin-top: 20px;">
                        <span v-if="addresses.length < 1">You don't have any address yet, please add one</span>
                        <br/>
                        <div v-if="addresses.length > 0" class="col-12">
                          <div class="col-sm-12 col-12 margin5px" for="input2">{{ addresses.length > 1 ? "Your address" : "Your addresses" }}</div>
                          </br>
                          <div class="col-md-1 hidesms"></div>
                          <ul class='list-group col-12 modalelist'>
                            <li :id="'shipping_' + address.id" v-for="address in addresses" class="list-group-item list-group-item-action" v-on:click="select('shipping_' + address.id)">
                              <div class="row ml-1">
                                <input class="mr-3 ml-0" type="radio" name="shippingaddress" :value="JSON.stringify(address)"/>
                                <div style="text-align: left">{{ address.name }}</div>
                                <div class="ml-auto mr-0" style="text-align: right">{{ address.city }}</div>
                                <div class="ml-3 mr-3" style="text-align: right"><div class="deletecard cross" v-on:click="deleteaddress(address.id)">╳</div></div>
                              </div>
                            </li>
                          </ul>
                          </br>
                        </div>
                        <div style="width:auto" class="wc-button" data-toggle="modal" data-target="#addressModal">Add a new address</div>
                      </container>
                      </div>
                      <container note="Choose or add a credit card"
                        name="Credit card"
                        hover=false
                        border=true
                        style="margin-top: 20px;">
                        <span v-if="cards.length < 1">You don't have any card yet, please add one</span>
                        <div v-if="cards.length > 0" class="col-12">
                          <div class="col-sm-12 col-12 margin5px" for="input2">{{ cards.length > 1 ? "Your cards" : "Your card" }}</div>
                          </br>
                          <div class="col-md-1 hidesms"></div>
                          <ul class='list-group col-8 offset-2 modalelist'>
                            <li :id="card.crd_token" v-for="card in cards" class="list-group-item list-group-item-action" v-on:click="select(card.crd_token)">
                              <div class="row ml-1">
                                <input class="mr-3 ml-0" type="radio" name="card" :value="JSON.stringify(card)"/>
                                <img class="mr-3 ml-0" :src="'imgs/' + card.brand + '.png'" style="width: 40px; height: auto">
                                <div style="text-align: left">**** **** **** {{ card.last4 }} </div>
                                <div class="ml-auto mr-0" style="text-align: right">{{ card.exp_month }}/{{ card.exp_year }}</div>
                                <div class="ml-3 mr-3" style="text-align: right"><div class="deletecard cross" v-on:click="deletecard(card.crd_token)" >╳</div></div>
                              </div>
                            </li>
                          </ul>
                          </br>
                        </div>
                        <div class="col-md-8 offset-md-2" style="margin-top: 10px;">
                          <div id="card"></div>
                        </div>
                        <br/>
                        <div style="width:auto" class="wc-button" v-on:click=addCreditCard>Add new credit card</div>
                      </container>
                      <div class="sepinput"></div>
                      <div style="width:auto; margin-left: auto" class="wc-button" v-on:click=showOrderHistory>Continue</div>
                    </div>
                    <div class="modal fade" id="addressModal" tabindex="-1" role="dialog" aria-hidden="true">
                      <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">Add an address</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          <div class="modal-body">
                            <div class="row">
                              <div class="col-12" v-for="input in modalInputs">
                                <div class="container">
                                  <div class="row">
                                    <div class="sepinput"></div>
                                    <div class="col-3" :for="'address_' + input.name">{{input.label}}</div>
                                    <input class="form-control compinput col-9" :id="'address_' + input.name" type="text" :placeholder="input.label" :name="'address_' + input.name" :maxlength="input.maxlength">
                                  </div>
                                </div>
                              </div>
                              <div class="sepinput"></div>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <div style="width:auto" class="wc-button" data-dismiss="modal" v-on:click=addAddress>Add new address</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="page == 2" class="col-md-12 marge" style="height: inherit;">
                    <container note="Check if all details are corrects"
                      name="Order details"
                      hover=true>
                      <container note="Your billing address"
                        name="Billing address"
                        hover=true
                        style="margin-top: 20px;">
                        <div class="row">
                          <div class="col-12" v-for="input in modalInputs">
                            <div class="container">
                              <div class="row">
                                <div class="sepinput"></div>
                                <div style="text-align: end" class="col-3" :for="'billingaddress_' + input.name">{{input.label}} :</div>
                                <div style="text-align: left" class="col-9" :id="'billingaddress_' + input.name">{{orderInfos.billingAddress[input.name]}}</div>
                              </div>
                            </div>
                          </div>
                          <div class="sepinput"></div>
                        </div>
                      </container>
                      <container note="Your shipping address"
                        name="Shipping address"
                        hover=true
                        style="margin-top: 20px;">
                        <div class="row">
                          <div class="col-12" v-for="input in modalInputs">
                            <div class="container">
                              <div class="row">
                                <div class="sepinput"></div>
                                <div style="text-align: end" class="col-3" :for="'shippingaddress_' + input.name">{{input.label}} :</div>
                                <div style="text-align: left" class="col-9" :id="'shippingaddress_' + input.name">{{orderInfos.shippingAddress[input.name]}}</div>
                              </div>
                            </div>
                          </div>
                          <div class="sepinput"></div>
                        </div>
                      </container>
                      <container note="Payment details"
                        name="Payment"
                        hover=true
                        style="margin-top: 20px;min-height: 0px;">
                        <div class="row">
                          <div class="col-6 offset-3">
                            <div class="row">
                              <img class="mr-3 ml-0" :src="'imgs/' + orderInfos.card.brand + '.png'" style="width: 40px; height: auto">
                              <div style="text-align: left">**** **** **** {{ orderInfos.card.last4 }} </div>
                              <div class="ml-auto mr-0" style="text-align: right">{{ orderInfos.card.exp_month }}/{{ orderInfos.card.exp_year }}</div>
                            </div>
                          </div>
                          <div class="sepinput"></div>
                          <div class="col-12">
                            <div class="row">
                              <div style="text-align: end" class="col-3" for="devices_number">Devices number :</div>
                              <div style="text-align: left" class="col-9" id="devices_number">{{devicesNumber}}</div>
                              <div style="text-align: end" class="col-3" for="devices_price">Price for devices :</div>
                              <div style="text-align: left" class="col-9" id="devices_price">{{prices.device}}€ X {{devicesNumber}} devices</div>
                              <div style="text-align: end" class="col-3" for="devices_sub">Price for subscription :</div>
                              <div style="text-align: left" class="col-9" id="devices_sub">{{prices.subscription}}€ X {{devicesNumber}} devices (This price will be deducted every month)</div>
                              <div style="text-align: end" class="col-3" for="devices_total">Total :</div>
                              <div style="text-align: left" class="col-9" id="devices_total">{{totalPrice}}€</div>
                            </div>
                          </div>
                        </div>
                      </container>
                      <div class="sepinput"></div>
                      <div style="width:auto;" class="wc-button" v-on:click=pay()>Validate the order</div>
                    </container>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           `
  }
  
