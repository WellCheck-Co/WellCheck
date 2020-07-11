Vue.use(vcdonut.default);
Vue.component('compModInfos', compModInfos);
Vue.component('compModPassword', compModPassword);

let vm = new Vue({
    el: '#profile',

    data: {
      email: localStorage.email,
      data: ''
    },

    components: {msg, leftnav, mod, profile},

    methods:{
      infos: function() {
        let headers = cred.methods.get_headers()
        user.methods.retrieve('infos', headers, this.store);
      },

      store: function(data) {
        if (data != '' && data.email != null) {
          localStorage.email = data.email;
        }

        this.data = JSON.parse(JSON.stringify(data));
        if (this.data.sections == void 0)
          this.data.sections =  [
            { label: "Subscription", value: 3, color: "#1C94FE"},
            { label: "Purchase", value: 3, color: "#211267" }
          ]
         this.data.totalpaid = "0";
      }
   },
   mounted(){
        cred.methods.api_cred()
        cred.methods.usr_cred()
        this.infos();
   }
})
