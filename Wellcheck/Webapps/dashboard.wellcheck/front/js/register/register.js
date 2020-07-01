let vm = new Vue({
    el: '#register',

    data: {
      password1: "",
      password2: "",
      email: "",
      conditions: false,
      send: false
    },

    components: { msg },

    methods:{
       register: function() {

         if (this.conditions == false) {
            vm.$refs.extern.set("You must accept the Terms & Conditions", "error")
            return;
          }
         this.send = true;
         let data = {
           headers: {},
           data: {
             'password1': this.password1,
             'password2': this.password2,
             'email': this.email,
           }
         };
         data.headers = cred.methods.get_headers()
         user.methods.register(data)
       }
   },
   mounted(){
        cred.methods.api_cred()
        cred.methods.usr_cred()
   }
})
