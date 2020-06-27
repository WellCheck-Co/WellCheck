let compModBilling = {
  data: function() {
    return {
      cards: []
    }
  },

  methods: {
    register: function () {
      this.stripe.createToken(card).then(this.retrieve_data);
    },
    retrieve_data: function(result) {
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
        user.methods.send('addcard', data, this.getcards);
      }
    },
    getcards: function (data) {
      let headers = cred.methods.get_headers()
      user.methods.retrieve('listcard', headers, this.store);
    },
    store: function (data) {
      this.cards = data['cards'];
    },
    deletecard: function (crd_token){
      let data = {}
      data['headers'] = cred.methods.get_headers()
      data['data'] = {
        'crd_token': crd_token,
      }
      user.methods.send('delcard', data, this.getcards);
    }
  },

  mounted(){
    this.stripe = Stripe(`pk_live_342u3Fth66OBYoQH5n4bHB3Z`),
    elements = this.stripe.elements(),
    style = {
      base: {
        border: '1px solid #D8D8D8',
        borderRadius: '4px',
        color: "#000",
      }
    },
    card = elements.create('card', style);
    card.mount(this.$refs.card);
    this.getcards();
  },


  template: `
    <div>
      <form class="insidecomp">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12">
              <div class="container">
                <div class="row">
                <div v-if="cards.length > 0" class="col-12">
                  <div class="hidemd col-sm-12 col-12 margin5px" for="input2">{{ cards.length > 1 ? "Your cards" : "Your card" }}</div>
                  </br>
                  <div class="col-md-1 hidesms"></div>
                  <ul class='list-group col-12 modalelist'>
                      <li v-for="card in cards" class="list-group-item list-group-item-action">
                        <div class="row ml-1">
                          <img class="mr-3 ml-0" :src="'imgs/' + card.brand + '.png'" style="width: 40px; height: auto">
                          <div style="text-align: left">**** **** **** {{ card.last4 }} </div>
                          <div class="ml-auto mr-0" style="text-align: right">{{ card.exp_month }}/{{ card.exp_year }}</div>
                          <div class="ml-3 mr-3" style="text-align: right"><div class="deletecard cross" v-on:click="deletecard(card.crd_token)" >╳</div></div>
                        </div>
                      </li>
                    </ul>
                    </br>
                  </div>
                  <div class="hidemd col-sm-12 col-12 margin5px" for="input2">Add a card</div>
                  </br></br>
                  <div class="col-md-1 hidesms"></div>
                  <div class="col-md-10 col-sm-12 col-12" id="input1">
                    <div ref="card"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <br><br>
      <div class="wc-button" v-on:click="register()"> add card </div>
    </div>
  `
}
