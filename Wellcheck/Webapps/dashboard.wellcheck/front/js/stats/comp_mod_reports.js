let compModReports = {
  data: function() {
    return {

    }
  },

  props: ['data'],

  filters:{
    tostr: function(timestamp) {
      let date = new Date(parseInt(timestamp));
      let day = ("00" + date.getDate())
      day = day.substr(day.length - 2);
      let month = ("00" + (date.getMonth() + 1))
      month = month.substr(month.length - 2);
      let str = day + '.' + month + '.' + date.getFullYear();
      return str;
    }
  },

    methods: {
      getarray: function(){
        var date = new Date();
        var timestamp = parseInt(date.getTime());
        var ret = []
        var date = parseInt(this.data.date);
        if (this.data.test == true) {
          date -= 1209600000;
        }
        while (date < timestamp){
          timef = {"starttime": date}
          date += 604800000;
          timef["endtime"] = date;
          ret.push(timef);
        }
        return (ret.reverse());
      }

    },



      template: `
      <div>
      Device: <b>{{ data.surname }} <small>since {{ data.date | tostr }}</small></b><br>
      <small>ID : <span style="color: #1C94FE">{{ data.id }}</span> </small><br>
      <small v-if="data.test == true "> Test data available from {{ data.date - 903600000 | tostr }}</small>
      <br><br>
      <ul class='list-group col-12 modalelist' style="width: calc(100% - 26px); height: 430px">
          <li v-for="report in getarray()" class="list-group-item list-group-item-action">
          <div class="row ml-1">
            <div class="ml-auto mr-auto">
              From
              <b>&nbsp;{{ report['starttime'] | tostr }}&nbsp;</b> to <b>&nbsp;{{ report['endtime'] | tostr }}</b>
            </div>
            <div class="row ml-auto mr-auto">
              <a :href="'https://doc.wellcheck.fr/src.php?id='+ data.id +'&from='+  parseInt(report['starttime'] / 1000) +'&to=' +  parseInt(report['endtime'] / 1000) " class="wc-button" style="width: 135px;"> Get report </a>
            </div>
            </div>
          </li>
        </ul>
      </div>
      `
    }
