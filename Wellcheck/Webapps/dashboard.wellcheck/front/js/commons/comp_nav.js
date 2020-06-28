let leftnav = {
  data: function() {
    return {
      type: 'open',
      email: localStorage.email,
      page: localStorage.page,
      open: true,
    }
  },
  methods: {
    changeopen: function() {
      this.open = !this.open;
      this.type = this.open ? 'open' : 'close';
    },
    modale: function(template) {
      this.opentemplate(template)
    },
    opentemplate: function(template) {
      var old = this.disableall();
      this.activate(template, old);
      vm.$refs.modal.changeopen(template);
    },
    activate: function(template, old) {
      if (template == old)
        return this.disableall;

      for (i in this.$refs) {
        elem = this.$refs[i];
        for (i2 in elem.classList)
          if (elem.classList[i2] == 'nav-second' && elem.innerHTML == template)
            elem.classList.add('nav-second-active');
      }
    },
    disableall: function() {
      for (i in this.$refs){
        elem = this.$refs[i];
        for (i2 in elem.classList)
          if (elem.classList[i2] == 'nav-second-active') {
            elem.classList.remove('nav-second-active');
            return elem.innerHTML;
          }
      }
      return null;
    },
    redirect: function(location){
      loc.methods.redirect(location)
    },
    changetest: function() {
      this.display_test = !this.display_test;
      localStorage.testmode = this.display_test;
      if (vm.$refs.modal.$refs.inside && vm.$refs.modal.$refs.inside.update){
        vm.$refs.modal.$refs.inside.update();
        console.log(vm.$refs.modal.$refs.inside.update());
      }
      if (vm.testpointer != void 0){
        vm.testpointer(this.display_test);
      }
    }
  },
  beforeMount(){
    this.display_test = localStorage.testmode == "true" ? true : false;
  },
  mounted: function () {
    this.$nextTick(function () {
      if (!Array.prototype.last){
        Array.prototype.last = function(){
          return this[this.length - 1];
        };
      };
      let elem = null;
      let add = false;
      let cont = false;
      for (i in this.$refs){
        elem = this.$refs[i];
        if (add){
          cont = false;
          for (i2 in elem.classList) {
            if (elem.classList[i2] == 'nav-second') {
              elem.classList.add('display');
              cont = true;
            }
          }
          if (cont == false) {
              add = false;
            }
        }
        let name = elem.innerHTML.split(' ').last();
        let upname = name.charAt(0).toUpperCase() + name.slice(1);
        if (name == this.page || upname == this.page) {
          elem.classList.add('nav-active');
          add = true;
        }
      }
      document.querySelector("#s2d.test-switch").checked = this.display_test;
    })
  },
  template: `
            <div class="nav" :class=type>
                <img v-if="!open"  class="menu-close" v-on:click=changeopen src="imgs/menu.png">
                <img v-if="open" class="menu-open"  v-on:click=changeopen src="imgs/back.png">
                <div test class="overflow">
                  <img class="img-nav" src="imgs/logo_v2.png" alt="">
                  <p>{{ email }}</p>
                  <div class="sep"></div>
                  <div ref="link1" class="nav-text"  v-on:click="redirect('/profile')"         >Your profile</div>
                  <div ref="link2" class="nav-text nav-second" v-on:click="modale('Billing')"   >Billing</div>
                  <div ref="link3" class="nav-text nav-second" v-on:click="modale('Invoices')"  >Invoices</div>
                  <div ref="link4" class="nav-text"  v-on:click="redirect('/map')"            >Map</div>
                  <div ref="link5" class="nav-text nav-second" v-on:click="modale('Devices')"    >Devices</div>
                  <div ref="link6" class="nav-text nav-second" v-on:click="modale('Share')"     >Share</div>
                  <div ref="link7" class="nav-text"  v-on:click="redirect('/stats')"            >Stats</div>
                  <div ref="link8" class="nav-text"  v-on:click="redirect('/basket')"            >Basket</div>
                  <div ref="link9" class="nav-text" v-on:click="user.methods.logout"          >Logout</div>
                  <br>
                  <div ref="link9" class="nav-text test-nav">
                    <input id="s2d" type="checkbox" class="switch test-switch" v-on:click=changetest>
                    <label for="s2d" style="font-size: 1rem;">Test mod</label>
                  </div>

                  <div class="w3copyright-agile in-nav">
              			<p>Wellcheck© 2020.<br>All Rights Reserved.</p>
            		  </div>
                </div>
             </div>
             `
}
