let compModOrders = {
  data: function() {
    return {
      orders: [],
      page: 0,
      order: undefined,
      modalInputs: [
        {"name": "name", "label": "Name", "maxlength": 50},
        {"name": "country", "label": "Country", "maxlength": 30},
        {"name": "city", "label": "City", "maxlength": 30},
        {"name": "address", "label": "Address", "maxlength": 100},
        {"name": "complement", "label": "Complement", "maxlength": 100},
        {"name": "postal_code", "label": "Postal code", "maxlength": 5}
      ],
      billingAddress: undefined,
      shippingAddress: undefined,
      prices: {
        "device": 249,
        "subscription": 10
      }
    }
  },

  methods: {
    getOrders: function() {
      let headers = cred.methods.get_headers()
      user.methods.retrieve('history', headers, this.storeOrders);
    },
    storeOrders: function(data) {
      if (data != '') {
        this.orders = data['orders'];
      }
    },
    getOrder: function(id) {
      let data = {
        "headers": cred.methods.get_headers(),
        "data": {"order_id": id}
      }
      user.methods.send('orderdetail', data, this.storeOrder);
    },
    storeOrder: function(data) {
      if (data != '') {
        this.order = data['order'];
        console.log(this.order);
        this.getAddress("billing", this.order.details.addresses.billingId);
        this.getAddress("shipping", this.order.details.addresses.shippingId);
        this.page = 1;
      }
    },
    getAddress: function(type, id) {
      let data = {
        "headers": cred.methods.get_headers(),
        "data": {"address_id": id}
      }
      user.methods.send('getaddress', data, type == "billing" ? this.storeBillingAddress : this.storeShippingAddress);
    },
    storeBillingAddress: function(data) {
      if (data != '') {
        this.billingAddress = data['address'];
      }
    },
    storeShippingAddress: function(data) {
      if (data != '') {
        this.shippingAddress = data['address'];
      }
    },
    goBack: function() {
      this.order = undefined;
      this.getOrders();
      this.page = 0;
    }
  },

  mounted(){
    this.getOrders();
  },


  template: `
    <div>
      <form class="insidecomp">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12">
              <div class="container">
                <div class="row">
                  <div v-if="page == 0 && orders.length > 0" class="col-12">
                    <div class="hidemd col-sm-12 col-12 margin5px" for="input2">{{ orders.length > 1 ? "Your orders" : "Your order" }}</div>
                    </br>
                    <div class="col-md-1 hidesms"></div>
                    <ul class='list-group col-12 modalelist'>
                      <li v-for="order in orders" class="list-group-item list-group-item-action" v-on:click="getOrder(order.id)">
                        <div class="row">
                          <div style="text-align: end" class="hidemd col-3" :for="'id_' + order.id">Identifier :</div>
                          <div style="text-align: left" class="col-9" :id="'id_' + order.id">{{order.id}}</div>
                          <div style="text-align: end" class="hidemd col-3" :for="'date_' + order.id">Date :</div>
                          <div style="text-align: left" class="col-9" :id="'date_' + order.id">{{order.date}}</div>
                        </div>
                      </li>
                    </ul>
                    </br>
                  </div>
                  <div v-if="page == 1 && order" class="col-12" style="overflow-y: scroll;max-height: 500px;">
                    <div class="row">
                      <div style="text-align: end" class="hidemd col-3" :for="'id_' + order.id">Identifier :</div>
                      <div style="text-align: left" class="col-9" :id="'id_' + order.id">{{order.id}}</div>
                      <div class="sepinput"></div>
                      <div style="text-align: end" class="hidemd col-3" :for="'date_' + order.id">Date :</div>
                      <div style="text-align: left" class="col-9" :id="'date_' + order.id">{{order.date}}</div>
                    </div>
                    <div class="row" v-if="billingAddress">
                      <div class="sepinput"></div>
                      <div class="col-12">
                        <h2 style="text-alignment: center;font-weight: bold;">Billing address</h2>
                      </div>
                      <div class="col-12" v-for="input in modalInputs">
                        <div class="container">
                          <div class="row">
                            <div class="sepinput"></div>
                            <div style="text-align: end" class="hidemd col-3" :for="'billingaddress_' + input.name">{{input.label}} :</div>
                            <div style="text-align: left" class="col-9" :id="'billingaddress_' + input.name">{{billingAddress[input.name]}}</div>
                          </div>
                        </div>
                      </div>
                      <div class="sepinput"></div>
                    </div>
                    <div class="row">
                      <div class="sepinput"></div>
                      <div class="col-12">
                        <h2 style="text-alignment: center;font-weight: bold;">Shipping address</h2>
                      </div>
                      <div class="col-12" v-for="input in modalInputs">
                        <div class="container">
                          <div class="row">
                            <div class="sepinput"></div>
                            <div style="text-align: end" class="col-3" :for="'shippingaddress_' + input.name">{{input.label}} :</div>
                            <div style="text-align: left" class="col-9" :id="'shippingaddress_' + input.name">{{shippingAddress[input.name]}}</div>
                          </div>
                        </div>
                      </div>
                      <div class="sepinput"></div>
                    </div>
                      <div class="row">
                        <div class="sepinput"></div>
                        <div class="col-12">
                          <h2 style="text-alignment: center;font-weight: bold;">Payment</h2>
                        </div>
                        <div class="sepinput"></div>
                        <div class="col-6 offset-3">
                          <div class="row">
                            <img class="mr-3 ml-0" :src="'imgs/' + order.payment.source.brand + '.png'" style="width: 40px; height: auto">
                            <div style="text-align: left">**** **** **** {{ order.payment.source.last4 }} </div>
                            <div class="ml-auto mr-0" style="text-align: right">{{ order.payment.source.exp_month }}/{{ order.payment.source.exp_year }}</div>
                          </div>
                        </div>
                        <div class="sepinput"></div>
                        <div class="col-12">
                          <div class="row">
                            <div style="text-align: end" class="col-3" for="devices_number">Devices number :</div>
                            <div style="text-align: left" class="col-9" id="devices_number">{{order.details.devicesNumber}}</div>
                            <div style="text-align: end" class="col-3" for="devices_price">Price for devices :</div>
                            <div style="text-align: left" class="col-9" id="devices_price">{{prices.device}}€ X {{order.details.devicesNumber}} devices</div>
                            <div style="text-align: end" class="col-3" for="devices_sub">Price for subscription :</div>
                            <div style="text-align: left" class="col-9" id="devices_sub">{{prices.subscription}}€ X {{order.details.devicesNumber}} devices (This price will be deducted every month)</div>
                            <div style="text-align: end" class="col-3" for="devices_total">Total :</div>
                            <div style="text-align: left" class="col-9" id="devices_total">{{order.details.price.amount}}€</div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
}
