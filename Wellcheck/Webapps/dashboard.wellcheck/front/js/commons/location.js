let loc = {
  methods: {
    redirect: function(location, force = false) {
      let actual = window.location.href.split(address)[1].split('?')[0]
      let page = location.charAt(1).toUpperCase() + location.slice(2).split('?')[0];
      if (force == true){
        localStorage.location = actual;
        localStorage.page = actual.charAt(1).toUpperCase() + actual.slice(2).split('?')[0];;
      }
      else if (actual != location.split('?')[0]) {
        msg.methods.redirect(true);
        if (location != '/login' && location != '/register' && location != '/valid'){
          localStorage.location = location;
          localStorage.page = page;
        }
        window.location.href = location;
      }
    }
  }
}
