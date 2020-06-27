let vm = new Vue({
    el: '#login',

    data: {
      password1: "",
      email: localStorage.email,
    },

    components: { msg },

    methods:{
       login: function() {
         let data = {
           headers: {},
           data: {
             'password1': this.password1,
             'email': this.email,
           }
         };
         data.headers = cred.methods.get_headers()
         user.methods.login(data)
       },
       logintest: function() {
         let data = {
           headers: {},
           data: {
             'password1': "test",
             'email': "test@test.fr",
           }
         };
         data.headers = cred.methods.get_headers()
         user.methods.login(data)
       }
   },
   mounted(){
        cred.methods.api_cred()
        cred.methods.usr_cred()
   }
})
