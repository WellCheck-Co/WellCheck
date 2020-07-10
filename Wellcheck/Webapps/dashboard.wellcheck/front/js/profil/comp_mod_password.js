let compModPassword = {
  data: function() {
    return {
      "pass1": "",
      "pass2": ""
    }
  },
  components: { vcdonut, container, warning},

  props: ['data'],

  methods: {
    close: function(data){
      console.log("updated");
    },

    updatepass: function(){
      let data = {}
      data['headers'] = cred.methods.get_headers()
      data['data'] = {
        'password1': this.pass1,
        'password2': this.pass2
      }
      user.methods.send('password', data, this.close);
    }
  },



  template: `
    <div>
      <form class="insidecomp">
        <div class="container">
          <div class="row">
            <div class="col-md-6 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-xl-5 col-sm-12 col-4 margin5px" for="firstname">Firstname</div>
                  <input class="form-control compinput col-xl-7  col-md-12  col-sm-12 col-8" id="firstname"  type="password" placeholder="Password" v-model=pass1>
                </div>
              </div>
            </div>
            <div class="intersepinput"></div>
            <div class="col-md-6 col-sm-12">
              <div class="container">
                <div class="row">
                  <div class="hidemd col-xl-5 col-sm-12 col-4 margin5px" for="lastname">Lastname</div>
                  <input class="form-control compinput col-xl-7  col-md-12  col-sm-12 col-8" id="lastname"  type="password" placeholder="Password" v-model=pass2>
                </div>
              </div>
            </div>
            <div class="sepinput"></div>
          </div>
        </div>
      </form>
      <br><br>
      <div class="wc-button" v-on:click="updatepass()"> update </div>
    </div>
  `
}
