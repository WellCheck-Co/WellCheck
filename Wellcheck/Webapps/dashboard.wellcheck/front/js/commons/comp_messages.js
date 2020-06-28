let msg = {
  data: function() {
    return {
      msg: null,
      type: "hide",
      uc: null,
      step: 0,
      interval: null,
      timeout: null
    }
  },
  props: {
    usualcenter: {
      default: true
    },
  },
  methods: {
    check: function (data, callback, redirect = true, message = false){
      if (data.status != 200){
        if (data.error == 'Invalid token'){
          cred.methods.api_cred(true);
        } else if (data.error == 'Invalid usrtoken') {
          user.methods.logout();
        }
        let type = "error";
        this.set(data.error, type);
        return;
      }
      if (redirect)
        this.redirect()
      else if (message) {
        this.set(message)
      }
      return callback(data.data);
    },
    redirect: function(succes = true) {
      let type = succes ? "succes" : "error"
      this.set("redirecting ...", type);
    },
    set: function (msg, type = "succes") {
      this.type = type
      this.msg = msg;
      this.checkstep();
      this.move();
      this.timeout = setTimeout(this.hideanime, 3000);
    },
    checkstep: function(){
      if (this.step > 0){
        clearInterval(this.interval);
        clearTimeout(this.timeout);
        document.getElementById("errorBar").style.width = "1%"
        this.step -= 1;
      }
      if (this.step > 0){
        document.getElementById("message").classList.remove('smooth');
        this.step -= 1;
      }
    },
    hideanime: function(){
      const e = document.getElementById("message");
      e.classList.add('smooth');
      this.step = 2;
      e.addEventListener("animationend", (ev) => {
        if (ev.type === "animationend") {
          e.classList.remove('smooth');
          this.hide();
        }
      }, false);
    },
    hide: function(){
      this.type = "hide";
      this.step = 0;
    },
    move: function() {
      var i = 0;
      if (i == 0) {
        i = 1;
        var elem = document.getElementById("errorBar");
        var width = 1;
        if (this.type != 'succes') {
          elem.style.backgroundColor = "rgb(250, 0, 0)"
        } else {
          elem.style.backgroundColor = "green";
        }
        this.interval = setInterval(frame, 35);
        this.step = 1;
        function frame() {
          if (width >= 100) {
            clearInterval(this.interval);
            i = 0;
          } else {
            width++;
            elem.style.width = width + "%";
          }
        }
      }
    }
  },
  mounted() {
    this.uc = this.usualcenter == true ? 'usualcenter' : '';
  },
  template: `<div class="txt-center errdiv" :class=uc>
                <div id="message" :class=type class="message"> {{ msg }}
                  <div id="cross" class="cross" :class=type v-on:click=hide>╳</div>
                  <div id="errorProgress">
                    <div id="errorBar"></div>
                  </div>
                </div>
            </div>`
}
