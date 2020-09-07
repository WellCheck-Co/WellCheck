let user = {
  methods: {
    register: function(data) {
      this.ajaxRequest = true;
      url = method + "://" + api + "/signup/";
      localStorage.email = data.data["email"];
      axios.post(url, data.data, { headers: data.headers})
        .then(response => vm.$refs.extern.check(response.data, this.storecred))
        .catch(error => this.error(error));

    },

    login: function(data) {
      this.ajaxRequest = true;
      url = method + "://" + api + "/signin/";
      localStorage.email = data.data["email"];
      axios.post(url, data.data, { headers: data.headers})
        .then(response => vm.$refs.extern.check(response.data, this.storecred))
        .catch(error => this.error(error));
    },

    retrieve: function(route, headers, callback) {
      url = method + "://" + api + '/' + route + '/';
      this.callapi(url, {headers: headers}, callback, 'GET')
    },

    send: function(route, data, callback){
      url = method + "://" + api + '/' + route + '/';
      this.callapi(url, data, callback, 'POST')
    },

    callapi: function(url, data, callback, req_method = 'GET'){
      this.ajaxRequest = true;
      if (req_method == 'GET') {
        axios.get(url, { headers: data.headers})
          .then(response => this.relay(response.data, callback, false))
          .catch(error => this.error(error));
      } else {
        axios.post(url, data.data, { headers: data.headers})
          .then(response => this.relay(response.data, callback, false))
        //  .catch(error => this.error(error));
      }
    },

    logout: function() {
      localStorage.removeItem("usrtoken");
      localStorage.removeItem("usrtoken_exp");
      cred.methods.usr_cred();
    },

    relay: function(data, callback, redirect, message = false) {
      vm.$refs.extern.check(data, callback, redirect, message)
    },

    test: function() {
      console.log(vm.$refs.extern);
    },

    error: function(error) {
      vm.$refs.extern.set(String(error), "error")
    },

    storecred: function(data) {
      localStorage.usrtoken = data['usrtoken'];
      localStorage.usrtoken_exp = cred.methods.time(data.exp);
      let location = localStorage.location ?  localStorage.location  : redirect;
      loc.methods.redirect(location);
    },
  }
}
