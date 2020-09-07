let vm = new Vue({
    el: '#cart',

    data: function(){
      return {
        email: localStorage.email,
        data: ''
      }
    },

    components: {msg, leftnav, mod, cart},

    mounted(){
     cred.methods.api_cred()
     cred.methods.usr_cred()
   }
})
