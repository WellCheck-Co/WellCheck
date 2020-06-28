let compModShare = {
  data: function() {
    return {
      toshare: [],
      emailto: "",
      points: [],
      shared: [],
      already: {},
      display_test: true
    }
  },

  filters:{
    tostr: function(timestamp) {
      let date = new Date(parseInt(timestamp));
      let day = ("00" + date.getDate())
      day = day.substr(day.length - 2);
      let month = ("0" + (date.getMonth() + 1))
      month = month.substr(day.length - 2);
      let str = day + '.' + month + '.' + date.getFullYear();
      return str;
    }
  },

  methods:{
    update: function(){
      this.points = JSON.parse(localStorage.points)['proprietary'];
      this.display_test = localStorage.testmode == "true" ? true : false;
      this.fshared();
      this.$nextTick(function () {
          document.querySelector("#c2d.test-checkbox").checked = this.display_test;
      });
    },
    fshared: function() {
      let headers = cred.methods.get_headers()
      user.methods.retrieve('points/shared', headers, this.sortshared);
    },
    sortshared: function(data){
      this.shared = data["shares"];
      this.sort()
    },
    switchshare: function(id){
      let inside = false;
      for( var i = 0; i < this.toshare.length; i++) {
        if ( this.toshare[i] === id) {
          this.toshare.splice(i, 1);
          inside = true;
        }
      }
      if (!inside)
        this.toshare.push(id);
    },
    share: function() {
      let data = {}
      let id;
      data['headers'] = cred.methods.get_headers()
      data['data'] = {
      	"id_points": this.toshare,
      	"email": this.emailto
      }
      for (const i in this.already){
        id = parseInt(i)
        if (this.toshare.includes(id)){
          for( var i2 = 0; i2 < this.toshare.length; i2++){
            if ( this.toshare[i2] === id) {
              this.toshare.splice(i2, 1);
            }
          }
        }
      }
      if (data["id_points"] == [])
        return;
      user.methods.send('point/share', data, this.fshared);
    },
    sort: function() {
      shared = {}
      for(const point in this.shared) {
        for (let i = 0; i < this.shared[point].length; i++) {
          if (this.shared[point][i].email == this.emailto) {
            shared[point] = [point, this.shared[point][i].date];
          }
        }
      }
      if (Object.keys(shared).length == 0){
        this.already = {}
        return;
      }
      this.already = shared;
    }
  },
  template: `
  <div>
    <form class="insidecomp">
      <div class="container">
        <div class="row">
          <div class="col-md-12 col-sm-12">
            <div class="container">
              <div class="row">
                <div class="hidemd col-sm-12 col-4 margin5px" for="email">Share to</div>
                <div class="col-md-3 hidesm"><br></div>
                <input v-on:input="sort()" class="form-control compinput col-md-6  col-sm-12 col-8" id="email" type="email" placeholder="email@to.share" v-model="emailto">
              </div>
            </div>
            <div class="sepinput"></div>
            <div class="container">
              <div class="row ml-2 mr-2">
                  <div class="col-sm-12 col-12 margin5px">{{ points.length > 1 ? "Your devices (" + points.length + ")" : "Your device" }}
                  <br><small>Test devices : <input id="c2d" type="checkbox" class="test-checkbox" v-on:click="display_test = !display_test"></small></div>
                  <br><br><br>
                  <div v-for="point in points" v-if="point.test == false || point.test == true && display_test == true" class="pointshare col-md-6 col-sm-6 col-lg-4" :style="already[point.id.toString()] != void 0 || point.test == true ? 'color: rgb(154, 156, 165);background-color: #f5f6fc' : ''">
                    <label for="c2d" class="ml-0 mr-5">{{ point.surname}}</label>
                    <input id="c2d" type="checkbox" class="ml-5 mr-0" :class="point.test == true ? 'test-checkbox large-checkbox' : ''" v-on:click="switchshare(point.id)" :checked="already[point.id.toString()] != void 0 || point.test == true" :disabled="already[point.id.toString()] != void 0 || point.test == true">
                    <div v-if="already[point.id.toString()] != void 0" style="text-align: center;font-size: 11px;padding: 0px;">
                        Shared {{ already[point.id.toString()][1] | tostr }}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <br><br>
    <div class="wc-button" v-on:click="share()"> Share </div>
  </div>
  `,
  mounted(){
    this.fshared();
    this.$nextTick(function () {
        document.querySelector("#c2d.test-checkbox").checked = this.display_test;
    });
  },
  beforeMount(){
    this.points = JSON.parse(localStorage.points)['proprietary'];
    this.display_test = localStorage.testmode == "true" ? true : false;
  }
};
