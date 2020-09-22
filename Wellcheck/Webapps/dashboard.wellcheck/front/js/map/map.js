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
      buildsvg: function(choice, note){
        label = {
        'test': '#ff970f',
				'your':'#1C94FE',
				'shared': '#79befa',
      };

        basenote = [
          ["#ff4444", "#aa0000"],
          ["#ffff0f", "#ff970f"],
          ["#03ff00", "#039900"]
        ];


        svg = '\
        <svg height="558pt" viewBox="0 0 558 558" width="558pt" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
            <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="0" x2="558" y1="279" y2="279">\
                <stop offset="0" stop-color="' + basenote[Math.floor(note / 7)][0] + '"/>\
                <stop offset="1" stop-color="' + basenote[Math.floor(note / 7)][1] + '"/>\
            </linearGradient>\
            <circle cx="279" cy="279" r="279" fill="' + label[choice] + '"/>\
            <path d="m279, 279m -250, 0a 250,250 0 1,0 500,0 a 250,250 0 1,0 -500,0" fill="url(#a)"/>\
            <path d="m425.960938 106.542969c-14.636719 0-26.5 11.863281-26.5 26.496093 0 1.726563.171874 3.414063.484374 5.046876l-36.210937 36.210937c-13.574219-8.984375-29.84375-13.367187-47.089844-12.472656-24.167969 1.257812-48.273437 12.789062-69.71875 33.351562-.664062.640625-1.324219 1.285157-1.984375 1.945313-32.925781 32.925781-62.105468 70.882812-80.0625 104.136718-23.480468 43.492188-22.882812 70.320313-15.035156 86.6875l-33.90625 33.90625c-5.859375 5.855469-5.859375 15.351563 0 21.210938 2.929688 2.929688 6.765625 4.394531 10.605469 4.394531 3.839843 0 7.679687-1.464843 10.605469-4.394531l34.121093-34.121094c6.136719 2.8125 13.636719 4.609375 22.824219 4.609375 18.851562 0 44.742188-7.539062 80.207031-29.214843 7.066407-4.320313 9.292969-13.554688 4.972657-20.621094-4.320313-7.070313-13.550782-9.300782-20.621094-4.976563-37.941406 23.195313-68.242188 30.867188-79.078125 20.03125-9.128907-9.128906-4.753907-32.777343 11.703125-63.257812 13.46875-24.949219 34.78125-53.933594 58.882812-80.402344l73.957032 73.957031c-5.660157 5.128906-11.488282 10.167969-17.449219 15.085938-6.390625 5.273437-7.296875 14.726562-2.027344 21.117187 5.273437 6.390625 14.726563 7.296875 21.117187 2.027344 12.796876-10.558594 25.03125-21.65625 36.367188-32.992187.664062-.664063 1.320312-1.332032 1.949219-1.992188 20.558593-21.4375 32.089843-45.542969 33.347656-69.707031.894531-17.257813-3.488281-33.519531-12.472656-47.09375l36.382812-36.382813c1.503907.261719 3.046875.410156 4.628907.410156 14.632812 0 26.496093-11.863281 26.496093-26.5 0-14.632812-11.863281-26.496093-26.496093-26.496093zm-58.5 134.503906c-.8125 15.679687-8.359376 31.867187-21.871094 47.0625l-74.457032-74.453125c15.191407-13.507812 31.382813-21.058594 47.066407-21.871094 13.664062-.707031 26.183593 3.796875 35.402343 12.679688.183594.207031.359376.421875.558594.621094.199219.199218.414063.375.621094.558593 8.882812 9.21875 13.390625 21.75 12.679688 35.402344zm0 0" fill="#fff"/>\
        </svg>\
        '
        ret = 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(svg);
        return ret
      },

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
        var types = ["proprietary", "shared"];
        for (var j = 0; j < types.length; j++){
        var type = types[j];
        for (var i = 0; i < this.markers[type].length; i++){
          if (this.markers[type][i]["data"].length > 0) {
            last_data = this.markers[type][i]["data"][0]
            this.markers[type][i]['note'] = 3
            this.markers[type][i]["marker"] = {
                  position: {
                              lat: parseFloat(last_data['data']['pos']['lat']),
                              lng: parseFloat(last_data['data']['pos']['lng'])
                            },
                  title:this.markers[type][i]["name"],
                  data: {'id': this.markers[type][i]['id'], 'order': i, 'test': this.markers[type][i]["test"]},
                  icon: {
                      url: this.buildsvg(this.markers[type][i]["test"] == true ? 'test' : 'your', this.markers[type][i]["data"][0]["data"]["data"]['note']), //this.markers['proprietary'][i]["test"] == true ? "./imgs/float.svg" : "./imgs/float.svg", // url
                      scaledSize: {height: 39, i: undefined, j: undefined, width: 39}, // scaled size
                      origin: {x: 0, y: 0} // origin
                  },
                  infoText:  `<div class="inf-content" style="font-size: 15px;">
                    <div class="container">
                      <div class="row">
                        <div class="col-12 col-sm-6" style="margin-top: 5px;">
                          Name: ` + this.markers[type][i]['name'] + `
                        </div>
                        <div class="col-12 col-sm-6" style="margin-top: 5px;">
                          <a href="./stats?bindlocal=true&page=Stats&selected=` + this.markers[type][i]['id'] +`&force=true">Go to Stats</a>
                        </div>
                        <div class="col-12 col-sm-6" style="font-size: 11px;margin-top: 5px;">
                          Since: ` + this.datestr(this.markers[type][i]['date']) + `
                        </div>
                        <div class="col-12 col-sm-6" style="font-size: 11px;margin-top: 5px;">
                          Last report: ` + (this.markers[type][i]['data'].length > 0 ? this.datestr(this.markers[type][i]['data'][0]["date"]) : '/' ) + `
                        </div>
                        <div class="col-12 col-sm-12" style="text-align: center; margin-top: 5px;">
                        Score: ` + (this.markers[type][i]["data"][0]["data"]["data"]['note'] != void 0 ? this.markers[type][i]["data"][0]["data"]["data"]['note'] / 2 : '_' ) + ` / 10
                        <div class="notebarholder">
                          <div class="notebar" style=" ` + (
                              this.markers[type][i]["data"][0]["data"]["data"]['note'] != void 0 ?
                              this.markers[type][i]["data"][0]["data"]["data"]['note'] > 15 ? 'background-color: #03ba00; width: ' + (this.markers[type][i]["data"][0]["data"]["data"]['note'] * 5) + '%;' :
                              this.markers[type][i]["data"][0]["data"]["data"]['note'] > 10 ? 'background-color: #ff970f; width: ' + (this.markers[type][i]["data"][0]["data"]["data"]['note'] * 5) + '%;' :
                              'background-color: red; width: ' + ((this.markers[type][i]["data"][0]["data"]["data"]['note'] + 1) * 5) + '%;' : 'width: 0%' ) + `">
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>`
                };
          }
        }
       }
      },
      testpointer: function(d){
        this.testmode = d + "";
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
        user.methods.send('points/infos', data, this.store);
      },
      store: function(data){
          if (data != '') {
            localStorage.points = JSON.stringify(data['points']);
            this.markers = data['points'];
            this.update();
          }
      }
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
