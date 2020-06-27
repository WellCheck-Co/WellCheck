let loc = {
  methods: {
    redirect: function(location) {
      let actual = window.location.href.split(address)[1].split('?')[0]
      let page = location.charAt(1).toUpperCase() + location.slice(2).split('?')[0];
      if (actual != location.split('?')[0]) {
        msg.methods.redirect(true);
        if (location != '/login' && location != '/register'){
          localStorage.location = location;
          localStorage.page = page;
        }
        window.location.href = location;
      }
    }
  }
}
