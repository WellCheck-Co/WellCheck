let cred = {
  methods: {
    usr_cred: function() {
      let actual = window.location.href.split(address)[1].split('?')[0]
      let get =  this.get_parm()
      if (get["bindlocal"] == "true"){
        for (i in get){
          if (i != "bindlocal") {
            localStorage[i] = "" + decodeURI(get[i]);
          }
        }
      }
      if (localStorage.usrtoken && this.checktime("usrtoken")) {
        let location = localStorage.location ?  localStorage.location  : redirect;
        loc.methods.redirect(location, (get["force"] == "true" ? true : false));
      } else {
        if (actual != "/" && actual != "/index" && actual != "/login" && actual != "/valid" )
          loc.methods.redirect('/login');
      }
    },

    api_cred: function(force = false) {
      if (!force && localStorage.api_token && this.checktime("api_token"))
        return;
      this.ajaxRequest = true;
      data = {
         "pass" : "password"
       };
      url = method + "://" + api + "/login/"
      axios.post(url, data)
           .then(
             response => {
               if (response.data.status == 200)
               {
                 localStorage.api_token = response.data.data.token;
                 localStorage.api_token_exp = this.time(response.data.data.exp);
                 if (force == true){
                   document.location.reload(true)
                 }
               }
             });
     },

     get_parm: function(){
       url = window.location.href.split(address)[1].split('?')[1];
       tmp = url == void 0 ? [] : url.split('&');
       get = {}
       for (i = 0; i < tmp.length; i++ ){
         t = tmp[i].split("=");
         if (t.length == 2){
           get["" + t[0]] = "" + t[1]
         }
       }
       return get;
     },

     time: function(exp = null){
       if (exp == null)
          return Math.round(new Date().getTime()/1000);
       time = Math.round(new Date(exp).getTime()/1000);
       return (time)
     },
     checktime: function(str)  {
       if (localStorage[str+"_exp"] < this.time() - 500) {
          localStorage.removeItem(str);
          localStorage.removeItem(str + "_exp");
          return false;
       }
       return true;
     },
     get_headers: function() {
       res = {}
       this.api_cred();
       res["token"] = localStorage.api_token;
       if (localStorage["usrtoken"] && this.checktime("usrtoken"))
         res["usrtoken"] = localStorage["usrtoken"];
       return res;
     }
   }
};
