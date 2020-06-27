let vm = new Vue({
    el: '#stats',

    data: function(){
      return {
        email: localStorage.email,
        data: ''
      }
    },

    components: {msg, leftnav, mod, stats},

    methods: {

      infos: function(res) {
        let data = {}
        data['headers'] = cred.methods.get_headers()
        data['data'] = {}
        user.methods.send('points/infos', data, this.store);
      },

      store: function(data) {
        if (data != '') {
          localStorage.points = JSON.stringify(data['points']);
          this.data = data['points'];
        }
      },
   },
   mounted(){
     cred.methods.api_cred()
     cred.methods.usr_cred()
     this.infos();
   }
})
