let compModInfos = {
  data: function() {
    return {

    }
  },
  components: { vcdonut, container, warning},

  props: ['data'],

  filters:{
    tostr: function(timestamp) {
      let date = new Date(parseInt(timestamp));
      let day = ("00" + date.getDate())
      day = day.substr(day.length - 2);
      let month = ("0" + (date.getMonth() + 1))
      month = month.substr(day.length - 2);
      let str = day + '.' + month + '.' + date.getFullYear();
      return str;
    }
  },

  watch: {
    "data.firstname": function(data){
      this.data.firstname = data;
    },
    "data.lastname": function(data){
      this.data.lastname = data;
    },
    "data.phone": function(data) {
      this.data.phone = data;
    }
  },

  methods: {
    store: function(data){
      this.data.phone = data['phone'];
      this.data.lastname = data['lastname']
      this.data.firstname = data['firstname']
      this.phonemask()
      this.$parent.$parent.infos()
      this.$parent.close()
    },

    updateinfos: function(){
      let data = {}
      data['headers'] = cred.methods.get_headers()
      data['data'] = {
        'firstname': this.data.firstname != void 0 ? this.data.firstname : "",
        'lastname': this.data.lastname != void 0 ? this.data.lastname : "",
        'phone': this.data.phone != void 0 ? this.data.phone : ""
      }
      user.methods.send('updateinfos', data, this.store);
    },

    phonemask: function(data = null){
      if (data == void 0)
      {
        data = document.getElementById('phone').value
      }
      data = data.replace(/[^0-9+]/g, '');
      data.padEnd(14, '');
      if (data.charAt(0) == '+') {
        let length = Math.ceil(data.length) - 2;
        if (length > 11) {
          data = data.substring(0, 12);
          length = Math.ceil(data.length) - 1;
        } else if (length == -1) {
          this.data.phone = '';
          return;
        }
        let maskreg = [
                   ['+$1',                /^[+](\d{1}).*/],
                   ['+$1',                /^[+](\d{2}).*/],
                   ['+$1-$2',             /^[+](\d{2})(\d{1}).*/],
                   ['+$1-$2-$3',          /^[+](\d{2})(\d{1})(\d{1}).*/],
                   ['+$1-$2-$3',          /^[+](\d{2})(\d{1})(\d{2}).*/],
                   ['+$1-$2-$3-$4',       /^[+](\d{2})(\d{1})(\d{2})(\d{1}).*/],
                   ['+$1-$2-$3-$4',       /^[+](\d{2})(\d{1})(\d{2})(\d{2}).*/],
                   ['+$1-$2-$3-$4-$5',    /^[+](\d{2})(\d{1})(\d{2})(\d{2})(\d{1}).*/],
                   ['+$1-$2-$3-$4-$5',    /^[+](\d{2})(\d{1})(\d{2})(\d{2})(\d{2}).*/],
                   ['+$1-$2-$3-$4-$5-$6', /^[+](\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{1}).*/],
                   ['+$1-$2-$3-$4-$5-$6', /^[+](\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2}).*/],
                   ['+$1-$2-$3-$4-$5-$6', /^[+](\d{3})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2}).*/]
                 ]
        let mask = maskreg[length][0];
        let reg = maskreg[length][1];
        this.data.phone = data.replace(reg, mask).substring(0, mask.length);
        document.getElementById('phone').value = this.data.phone
        return this.data.phone
      } else {
        let length = Math.ceil(data.length) - 1;
        if (length > 9) {
          data = data.substring(0, 10);
          length = Math.ceil(data.length) - 1;
        } else if (length == -1) {
          this.data.phone = '';
          return;
        }
        let maskreg = [
                   ['$1', /^(\d{1}).*/],
                   ['$1', /^(\d{2}).*/],
                   ['$1-$2', /^(\d{2})(\d{1}).*/],
                   ['$1-$2', /^(\d{2})(\d{2}).*/],
                   ['$1-$2-$3', /^(\d{2})(\d{2})(\d{1}).*/],
                   ['$1-$2-$3', /^(\d{2})(\d{2})(\d{2}).*/],
                   ['$1-$2-$3-$4', /^(\d{2})(\d{2})(\d{2})(\d{1}).*/],
                   ['$1-$2-$3-$4', /^(\d{2})(\d{2})(\d{2})(\d{2}).*/],
                   ['$1-$2-$3-$4-$5', /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{1}).*/],
                   ['$1-$2-$3-$4-$5', /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2}).*/]
                 ]
        let mask = maskreg[length][0];
        let reg = maskreg[length][1];
        this.data.phone = data.replace(reg, mask).substring(0, mask.length);
        if (this.data.phone.length >= 14){
          this.data.phone.substring(0, 13);
        }
        document.getElementById('phone').value = this.data.phone
        return this.data.phone
        }
      }
  },



  template: `
    <div>
      <form class="insidecomp">
        <div class="container">
          <div class="row">
            <div class="col-md-12 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-sm-12 col-4 margin5px" for="input2">Email</div>
                  <div class="col-md-3 hidesm"></div>
                  <input class="form-control compinput col-md-6  col-sm-12 col-8" id="input1"  style="pointer-events:none"type="text" placeholder="Phone number" :value=data.email disabled>
                </div>
              </div>
            </div>
            <div class="col-md-12 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-sm-12 col-4 margin5px" for="input2"></div>
                  <div class="col-md-3 hidesm"></div>
                  <small class="col-md-6 col-sm-12 col-8 softtext"   type="text" placeholder="Phone number">
                    Inscrit depuis le {{ data.date | tostr }}
                  </small>
                </div>
              </div>
            </div>
            <div class="sepinput"></div>
            <div class="col-md-6 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-xl-5 col-sm-12 col-4 margin5px" for="firstname">Firstname</div>
                  <input class="form-control compinput col-xl-7  col-md-12  col-sm-12 col-8" id="firstname"  type="text" placeholder="First name" v-model=data.firstname>
                </div>
              </div>
            </div>
            <div class="intersepinput"></div>
            <div class="col-md-6 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-xl-5 col-sm-12 col-4 margin5px" for="lastname">Lastname</div>
                  <input class="form-control compinput col-xl-7  col-md-12  col-sm-12 col-8" id="lastname"  type="text" placeholder="Last name" v-model=data.lastname>
                </div>
              </div>
            </div>
              <div class="sepinput"></div>
            <div class="col-md-12 col-sm-12">
              <div class="container">
                <div class="row">
                <div class="hidemd col-sm-12 col-4 margin5px" for="phone">Phone </div>
                <div class="col-md-3 hidesm"></div>
                <input v-on:input="phonemask()" class="form-control compinput col-md-6  col-sm-12 col-8" id="phone"  type="text" placeholder="Phone number" :value=this.data.phone >
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <br><br>
      <div class="wc-button" v-on:click="updateinfos()"> update </div>
    </div>
  `
}
