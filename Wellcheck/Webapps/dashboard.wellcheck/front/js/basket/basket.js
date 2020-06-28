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
   }
})
