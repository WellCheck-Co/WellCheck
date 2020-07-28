let profile = {
  data: function() {
    return {
        email: localStorage.email,
        background: "rgb(255, 255, 255)",
        foreground: "rgb(246, 245, 247)",
        interval: null,
        angle: 0,
        donut: "left",
        infos: true
    }
  },

  components: { vcdonut, container, warning},

  props: {data: {default: void 0}},

  methods: {
    animevis: function(){
      if (this.angle >= 360) {
        this.angle = 0;
      } else {
        this.angle++;
      }
    },

    updatevisend: function(save) {
        clearInterval(this.interval);
        this.angle = 0;
        this.data.sections = [
            { label: "Subscription", value: 3, color: "#1C94FE"},
            { label: "Purchase", value: 3, color: "#211267" }
          ];

    },

    updatevis: function () {
      if (this.interval != void 0){
	return;	
      }
      var value = 0;
      var sections = JSON.parse(JSON.stringify(this.data.sections));

      for (var i in sections) {
        value++;
        sections[i]['value'] = value;
      }

      this.data.sections = sections
      this.interval = setInterval(this.animevis, 6);
      setTimeout(this.updatevisend, 4000);
    },

    editProfile: function () {
      vm.$refs.nav.modale('Infos');
      let data;
      if (this.data == void 0) {
        data = {}
      }
      else {
        data = this.data;
      }
      if (data['email'] == void 0)
        data['warning'] = true;
      else
        data['note'] = "These informations are privates and will not be shared";

      vm.$refs.modal.loaddata(data);
    },
    changePassword: function () {
      vm.$refs.nav.modale('Password');
      let data;
      if (this.data == void 0) {
        data = {}
      }
      else {
        data = this.data;
      }
      if (data['email'] == void 0)
        data['warning'] = true;
      else
        data['note'] = "These informations are privates and will not be shared";

      vm.$refs.modal.loaddata(data);
    },
    price: function (str) {
      if (str == void 0){
        str = 0;
      }
      let price = parseFloat(str).toFixed(2) + ""
      let pricehtml = "<b>" + price.split(".")[0] + ".<span style='font-size: 60%;'>" + price.split(".")[1] + "</span>$</b>";
      return pricehtml;
    },
  },

  watch: {
    data: function(){
      if (this.data != void 0 && this.data.email != void 0)
        this.infos = false;
      else
        this.infos = true;
    }
  },
  filters: {
    exist: function(str){
      if (str == "" || str == void 0 )
        return "____";
      return str;
    },
    checksize: function(placement){
      if (window.innerWidth < 500)
        return "bottom";
      return placement;
    },
    sizedefine: function(placement){
      if (placement == "bottom")
        return "220";
      return "170";
    },
    upper: function(str){
      if (str == void 0)
        return;
      return str.toUpperCase();
    },
    datetostr: function(timestamp){
      var date = new Date(parseInt(timestamp));

      if (date.getTime() !== date.getTime())
        return '';

      const monthNames = ["January", "February", "March",
                          "April", "May", "June",
                          "July", "August", "September",
                          "October", "November", "December"];

      return date.getDate() + " " + monthNames[date.getMonth()] + " "
           + date.getFullYear() + " " + date.getHours() + "h"
           + date.getMinutes();
    }
  },

  template: `
            <div class="main">
              <div class="usualcenter infos">
                <div class="container">
                  <div class="row">
                    <div class="col-lg-12">
                      <h1 class="txt-lt">Your profile</h1>
                    </div>
                  </div>
                  <br>
                  <div class="row">
                  <div class="row col-lg-5 col-md-12">
                    <div class="col-lg-12 col-md-6 col-sm-12" style="margin-bottom: 30px">
                      <container name="Infos" hover=true :warning=infos>
                        <div class="container">
                          <div class="row">
                            <div class="col-12 txt-lt">
                              <warning
                                :display="(!infos && (data == void 0 ||
                                           data.lastname == void 0 ||
                                           data.firstname == void 0 ||
                                           data.lastname == '' ||
                                           data.firstname == '' ))"
                                note="This part of your profile not complete"
                              >
                              </warning>
                              name: {{data.lastname | upper | exist}} {{data.firstname | exist}}
                              <br>
                              <warning
                                :display="(!infos && (data == void 0 ||
                                           data.email == void 0 ))"
                                note="This part of your profile is empty"
                              >
                              </warning>
                              email: {{data.email | exist}}
                              <br>
                              <warning
                                :display="(!infos && (data == void 0 ||
                                           data.phone == void 0 ||
                                           data.phone == '' ) )"
                                note="This part of your profile is empty"
                              >
                              </warning>
                              phone: {{data.phone | exist}}
                            </div>
                          </div>
                        </div>
                        <br>
                        <div class="wc-button" v-on:click=editProfile> update </div>
                      </container>
                    </div>
                    <div class="col-lg-12 col-md-6 col-sm-12" style="margin-bottom: 30px">
                    <container name="Password" hover=true>
                        <br>
                        <div class="wc-button" style="width: 100%" v-on:click=changePassword> Change your password </div>
                      </container>
		    </div>
                    </div>
                    <div class="row col-lg-7 col-sm-12">
                    <div class="col-12">
                      <container note="Your consomption for this month, it may take up to 10 hours to update" name="Current Consumption" hover=true :warning="(data == void 0 || data.totalpaid == void 0 )">
                        <vc-donut ref='donut'
                          :background=background
                          :foreground=foreground
                          has-legend :legend-placement="donut | checksize"
                          :size="donut | checksize | sizedefine"
                          :sections=data.sections
                          :start-angle=angle
                          >
                            <h3 v-html="price(data.totalpaid)" style="margin-bottom: 0;"></h3>
                            <span>excl. taxes</span>
                        </vc-donut>
                        <br>
                        <div class="wc-button" v-on:click="updatevis()"> update </div>
                      </container>
                    </div>
                    </div>
		  </div>
                  </div>
                </div>
              </div>
            </div>
           `
}
