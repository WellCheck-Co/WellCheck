let vm = new Vue({
    el: '#valid',

    data: {
      act_key: localStorage.act_key,
    },

    components: { msg },

    methods:{
       validate: function() {
         let data = {
           headers: {},
           data: {
             "key": this.act_key.trim()
           }
         };
         data.headers = cred.methods.get_headers()
         user.methods.validate(data)
       }
   },
   mounted(){
        cred.methods.api_cred();
        cred.methods.usr_cred();
        this.act_key = localStorage.act_key;
   }
})
