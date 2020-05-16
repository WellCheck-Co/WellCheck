Vue.component('compModDevices', compModDevices);
Vue.component('compModShare', compModShare);
Vue.component('compModAdd_a_device', compModAdd_a_device);
Vue.use(VueGoogleMaps, {
  load: {key: 'AIzaSyDbGl0_XwDOzKEqu-CrXstGvjlTbsNXNTs',libraries: 'places'},
  autobindAllEvents: false,
  installComponents: true
})


let vm = new Vue({
    el: '#map',

    data: function(){
      return {
        email: localStorage.email,
        markers: null,
        infoWindowPos: null,
        infoWinOpen: false,
        currentMidx: null,
        testmode: localStorage.testmode,
        infoOptions: {
        content: '',
          //optional: offset infowindow so it visually sits nicely on top of our marker
          pixelOffset: {
            width: 0,
            height: -35
          }
        },
      }
    },

    components: {msg, leftnav, mod},

    methods:{
      datestr: function(timestamp) {
        let date = new Date(parseInt(timestamp));
        let day = ("00" + date.getDate())
        day = day.substr(day.length - 2);
        let month = ("0" + (date.getMonth() + 1))
        month = month.substr(day.length - 2);
        let str = day + '.' + month + '.' + date.getFullYear();
        return str;
      },
      update: function(){
        var test;
        var last_data;
        for (var i = 0; i < this.markers['proprietary'].length; i++){
          if (this.markers['proprietary'][i]["data"].length > 0) {
            last_data = this.markers['proprietary'][i]["data"][0]
            this.markers['proprietary'][i]['note'] = 3
            this.markers['proprietary'][i]["marker"] = {
                  position: {
                              lat: last_data['data']['pos']['lat'],
                              lng: last_data['data']['pos']['lon']
                            },
                  title:this.markers['proprietary'][i]["name"],
                  data: {'id': this.markers['proprietary'][i]['id'], 'order': i, 'test': this.markers['proprietary'][i]["test"]},
                  icon: {
                      url: this.markers['proprietary'][i]["test"] == true ? "./imgs/float_test.svg" : "./imgs/float.svg", // url
                      scaledSize: {height: 35, i: undefined, j: undefined, width: 35}, // scaled size
                      origin: {x: 0, y: 0} // origin

                  },
                  infoText:  `<div class="inf-content" style="font-size: 15px;">
                    <div class="container">
                      <div class="row">
                        <div class="col-12 col-sm-6" style="margin-top: 5px;">
                          Name: ` + this.markers['proprietary'][i]['name'] + `
                        </div>
                        <div class="col-12 col-sm-6" style="margin-top: 5px;">
                          Surname: ` + this.markers['proprietary'][i]['surname'] + `
                        </div>
                        <div class="col-12 col-sm-6" style="font-size: 11px;margin-top: 5px;">
                          Since: ` + this.datestr(this.markers['proprietary'][i]['date']) + `
                        </div>
                        <div class="col-12 col-sm-6" style="font-size: 11px;margin-top: 5px;">
                          Last report: ` + (this.markers['proprietary'][i]['data'].length > 0 ? this.datestr(this.markers['proprietary'][i]['data'][0]["date"]) : '/' ) + `
                        </div>
                        <div class="col-12 col-sm-12" style="text-align: center; margin-top: 5px;">
                        Note: ` + (this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] ? this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] : '_' ) + ` / 20
                        <div class="notebarholder">
                          <div class="notebar" style=" ` + (
                              this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] ?
                              this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] > 15 ? 'background-color: #03ba00; width: ' + (this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] * 5) + '%;' :
                              this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] > 10 ? 'background-color: #ff970f; width: ' + (this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] * 5) + '%;' :
                              'background-color: red; width: ' + (this.markers['proprietary'][i]["data"][0]["data"]["data"]['note'] * 5) + '%;' : 'width: 0%' ) + `">
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>`
                };
          }
        }

      },
      testpointer: function(d){
        this.testmode = d + "";
        console.log(this.currentMidx)
        if ((this.testmode == "false" || this.testmode == void 0) && this.currentMidx != void 0 && this.markers['proprietary'][this.currentMidx].test == true) {
          this.infoWinOpen = false;
       } else if (this.testmode == "true" && this.currentMidx != void 0 && this.markers['proprietary'][this.currentMidx].test == true) {
         this.infoWinOpen = true;
       }
      },

      toggleInfoWindow: function(marker, idx) {
        m = marker.marker
        this.infoWindowPos = m.position;
        this.infoOptions.content = m.infoText;
        if (this.currentMidx == idx) {
          this.infoWinOpen = !this.infoWinOpen;
        }
        else {
          this.infoWinOpen = true;
          this.currentMidx = idx;
        }
      },

      infos: function(res) {
        let data = {}
        data['headers'] = cred.methods.get_headers()
        data['data'] = {}
        if (res == void 0 || res['data_added'] == void 0){
          user.methods.send('points/infos', data, this.store);
        } else {
          user.methods.send('points/infos', data, this.storebis);
        }
      },
      storebis: function(data){
          if (data != '') {
            localStorage.points = JSON.stringify(data['points']);
            this.markers = data['points'];
            this.update();
          }
      },
      store: function(data) {
        if (data != '') {
          localStorage.points = JSON.stringify(data['points']);
          this.markers = data['points'];
          this.update();
          for (var i = 0; i < this.markers['proprietary'].length; i++){
            if (this.markers['proprietary'][i]['test'] == true && this.markers['proprietary'][i]['data'].length == 0){
              let data = {}
              data['headers'] = cred.methods.get_headers()
              console.log(this.$refs.main);
              data['data'] = {
                "data": {
                	"data": -1,
                	"pos": {"lon": this.$refs.main.$mapObject.center.lng(), "lat": this.$refs.main.$mapObject.center.lat()}
                },
                "point_id": this.markers['proprietary'][i]['id'],
                "sig_id": -1
              };
              user.methods.send('data/add', data, this.infos);
            }
          }
        }
      },
   },
   mounted(){
     cred.methods.api_cred()
     cred.methods.usr_cred()
     this.$refs.main.$mapPromise.then((map) => {
       if (localStorage.position != null) {
         let position = JSON.parse(localStorage.position);
         map.setCenter({lat:position['lat'], lng:position['lng']});
         map.setZoom(position['zoom']);
       }
       this.$refs.main.$on('zoom_changed', function(){
         let center = map.getCenter();
         let pos = {'lat': center.lat(), 'lng': center.lng(), 'zoom': map.getZoom()};
         localStorage.position = JSON.stringify(pos);
       });
       this.$refs.main.$on('dragend', function(){
         let center = map.getCenter();
         let pos = {'lat': center.lat(), 'lng': center.lng(), 'zoom': map.getZoom()};
         localStorage.position = JSON.stringify(pos);
       });
       this.infos();
     })

   }
})
