let stats = {
data: function() {
  return {
    limit: 0,
    selected: [],
    charts: {"chart1": null, "chart2": null, "chart3": null},
    received: ["ph", 0],
    testmod: (localStorage.testmode == 'true' ? true : false),
    request: 0,
  }
},

components: {container, warning},

props: {data: {default: void 0}},

watch:{
  data:function(newd, oldd){
    var i;
    var i2;
    var arr;
    if (this.data["proprietary"].length + this.data["shared"].length == 0){
      this.request = 1;
    }
    if (typeof localStorage["selected"] == "string"){
      if (this.data["proprietary"].length > 0){
        for ( i2 = 0; i2 < this.data["proprietary"].length; i2++) {
          if (this.data["proprietary"][i2].id == localStorage["selected"]) {
            i =  this.data["proprietary"][i2]
            arr = [i.id, i.surname, i.data, i.date, i.test]
            this.select(arr);
          }
        }
      } else if (this.data["shared"].length > 0){
        for ( i2 = 0; i2 < this.data["shared"].length; i2++) {
          if (this.data["shared"][i2].id == localStorage["selected"]) {
            i =  this.data["shared"][i2]
            arr = [i.id, i.surname, i.data, i.date, i.test]
            this.select(arr);
          }
        }
      }
    }
    if (oldd == "" && this.selected.length == 0 && arr == void 0){
      if (this.data["proprietary"].length > 0){
        i =  this.data["proprietary"][0]
        arr = [i.id, i.surname, i.data, i.date, i.test]
      } else if (this.data["shared"].length > 0){
        i =  this.data["shared"][0]
        arr = [i.id, i.surname, i.data, i.date, i.test]
      }
      this.select(arr);
    }

  }
},

filters:{
  tostr: function(timestamp) {
    let actual = parseInt(new Date().getTime());
    let date = parseInt(timestamp)
    let last = actual - date;
    let min = Math.floor((last/1000/60) << 0);
    if (min >= 60){
      min = (Math.floor(min / 60)+ "").padStart(2, "0") + "h " + ((min % 60)+ "").padStart(2, "0")
    } else {
      min = (min + "").padStart(2, "0")
    }
    min = min.padStart(7, ' ')
    return min
  },

},


methods: {
  reportlist: function () {
    vm.$refs.nav.modale('Reports');
    let data;
    data = {"id": this.selected[0],
            "surname": this.selected[1],
            "date": this.selected[3],
            "test": this.selected[4]
           }
    vm.$refs.modal.loaddata(data);
  },

  testpointer: function(teststatus) {
    this.testmod = teststatus;
  },

  cap: function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
},

  select: function(arr){
    this.selected = arr;
    if (arr != void 0){
      this.infos(arr[0]);
    }
  },
  create0: function(){
    var ctx = document.getElementById('globalbar')
    ctx = ctx.getContext('2d');
    var barChartData = {
			labels: ['Good', 'Medium', 'Bad'],
			datasets: [{
				label: 'Test',
				backgroundColor: '#ff970f',
				data: [
					0,
					0,
					0,
				]
			}, {
				label: 'Your\'s',
				backgroundColor:'#1C94FE',
				data: [
					0,
					0,
					0,
				]
			}, {
				label: 'Shared with you',
				backgroundColor: '#79befa',
				data: [
					0,
					0,
					0,
				]
			}]

		};

			this.charts["chart0"] = new Chart(ctx, {
				type: 'bar',
				data: barChartData,
				options: {
					tooltips: {
						mode: 'index',
						intersect: false
					},
					responsive: true,
					scales: {
						xAxes: [{
							stacked: true,
						}],
						yAxes: [{
              ticks: {
							min: 0
						  },
							stacked: true
						}]
					}
				}
			});

  },

  create1: function(){
    var ctx = document.getElementById('chart1')
    ctx = ctx.getContext('2d');
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var color = Chart.helpers.color;
    var timeFormat = 'MM/DD/YYYY HH:mm';

      this.charts["chart1"] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: "Note ",
            backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
            borderColor: window.chartColors.red,
            borderWidth: 1,
            data: []
          }]
        },
        options: {
          responsive: true,
          legend: {
            position: 'top',
            display: false,
          },
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                min: 0,
                max: 20,
                stepSize: 5
              }
            }],
            xAxes: [{
              type: 'time',
              distribution: 'series',
              time: {
                parser: timeFormat,
                tooltipFormat: 'll HH:mm'
              },
              scaleLabel: {
                display: false,
                labelString: 'Date'
              }
            }]
          },
          tooltips: {
  					intersect: false,
  					mode: 'index',
  					callbacks: {
  						label: function(tooltipItem, myData) {
  							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
  							if (label) {
  								label += ': ';
  							}
  							label += parseFloat(tooltipItem.value).toFixed(2);
  							return label;
  						}
  					}
  				}
        }
      });
  },

  create2: function(){
    var ctx = document.getElementById('chart2')
    ctx = ctx.getContext('2d');
    var timeFormat = 'MM/DD/YYYY HH:mm';

		function newDate(days) {
			return moment().add(days, 'd').toDate();
		}

		function newDateString(days) {
			return moment().add(days, 'd').format(timeFormat);
		}

		var color = Chart.helpers.color;
		var config = {
			type: 'line',
			data: {

				datasets: [{
					label: 'Low limit',
					backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
					borderColor: window.chartColors.green,
          borderDash: [5, 5],
          pointRadius: 0,
					fill: '1',
					data: [],
				}, {
					label: 'High limit',
					backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
					borderColor: window.chartColors.green,
          borderDash: [5, 5],
          pointRadius: 0,
					fill: '-1',
					data: []
				}, {
					label: 'Dataset with point data',
					backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
					borderColor:  window.chartColors.red,
          pointRadius: 0,
          pointHoverRadius: 0,
					fill: false,
					data: [],
				}]
			},
			options: {
        legend: {
          position: 'top',
          display: false,
        },
        elements: {
						point: {
							pointStyle: 'point'
						}
					},
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							parser: timeFormat,
							// round: 'day'
							tooltipFormat: 'll HH:mm'
						},
						scaleLabel: {
							display: false,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: false,
              labelString: 'PH'
						}
					}]
				},
        tooltips: {
					intersect: false,
					mode: 'index',
					callbacks: {
						label: function(tooltipItem, myData) {
							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += parseFloat(tooltipItem.value).toFixed(2);
							return label;
						}
					}
				}
			}
		};

		this.charts["chart2"] = new Chart(ctx, config);

  },

  create3: function(){
    var ctx = document.getElementById('chart3')
    ctx = ctx.getContext('2d');

		var color = Chart.helpers.color;
		var cfg = {
			data: {
				datasets: [{
					label: 'ph',
					backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
					borderColor: window.chartColors.red,
					data: [],
					type: 'line',
					pointRadius: 0,
					fill: false,
					lineTension: 0,
					borderWidth: 2
				}]
			},
			options: {
        legend: {
          position: 'top',
          display: false,
        },
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						offset: true,
            scaleLabel: {
							display: false,
							labelString: 'Date'
						},
						ticks: {
							major: {
								enabled: true,
								fontStyle: 'bold'
							},
							source: 'data',
							autoSkip: true,
							autoSkipPadding: 75,
							maxRotation: 0,
							sampleSize: 100
						}}],
					yAxes: [{
						gridLines: {
							drawBorder: false
						},
						scaleLabel: {
							display: false,
							labelString: 'PH'
						}
					}]
				},
				tooltips: {
					intersect: false,
					mode: 'index',
					callbacks: {
						label: function(tooltipItem, myData) {
							var label = myData.datasets[tooltipItem.datasetIndex].label || '';
							if (label) {
								label += ': ';
							}
							label += parseFloat(tooltipItem.value).toFixed(2);
							return label;
						}
					}
				}
			}
		};
		this.charts["chart3"] = new Chart(ctx, cfg);
  },

  change: function(name){
    if (this.received[1] == 1){
      this.received = [name, 0];
      this.infos(this.selected[0]);
    }
  },

  infos: function(id) {
    let data = {}
    data['headers'] = cred.methods.get_headers()
    data['data'] = {
    	"id_point": id,
    	"datas": this.received[0]
    }
    this.received[1] = 0
    if (id != void 0)
      user.methods.send('point/graph', data, this.store);
    else
     this.request = 1;
  },

  store: function(data) {
    if (data != '') {
       if ( this.charts["chart1"] != void 0) {
         this.charts["chart0"].config.data.datasets[0] = data["chart0"]["Test"]
         this.charts["chart0"].config.data.datasets[1] = data["chart0"]["Your\'s"]
         this.charts["chart0"].config.data.datasets[2] = data["chart0"]["Shared with you"]
         this.charts["chart0"].update();

         this.charts["chart1"].config.data.labels = data["chart1"]["data"]["label"];
         this.charts["chart1"].update();
         this.charts["chart1"].config.data.datasets[0].data = data["chart1"]["data"]["data"];
         this.charts["chart1"].update();
         
         this.charts["chart2"].config.data.datasets[2].data = data["chart2"][this.received[0]]["data"];
         this.charts["chart2"].config.data.datasets[0].data = [{
           x: data["chart2"][this.received[0]]["limits"]["y"]["min"],
           y: data["chart2"][this.received[0]]["limits"]["opt"]["low"]
         }, {
           x: data["chart2"][this.received[0]]["limits"]["y"]["max"],
           y: data["chart2"][this.received[0]]["limits"]["opt"]["low"]
         }];
         this.charts["chart2"].config.data.datasets[1].data = [{
           x: data["chart2"][this.received[0]]["limits"]["y"]["min"],
           y: data["chart2"][this.received[0]]["limits"]["opt"]["high"]
         }, {
           x: data["chart2"][this.received[0]]["limits"]["y"]["max"],
           y: data["chart2"][this.received[0]]["limits"]["opt"]["high"]
         }];
         this.charts["chart2"].config.options.scales.yAxes[0].ticks.min = data["chart2"][this.received[0]].limits.x.min
         this.charts["chart2"].config.options.scales.yAxes[0].ticks.max = data["chart2"][this.received[0]].limits.x.max
         this.charts["chart2"].config.data.datasets[2].label = this.received[0]
         this.charts["chart2"].update();
         this.charts["chart3"].config.data.datasets[0].data = data["chart3"][this.received[0]]["data"];
         this.charts["chart3"].config.options.scales.yAxes[0].ticks.min = data["chart3"][this.received[0]].limits.x.min
         this.charts["chart3"].config.options.scales.yAxes[0].ticks.max = data["chart3"][this.received[0]].limits.x.max
         this.charts["chart3"].config.data.datasets[0].label = this.received[0]
         this.charts["chart3"].update();
         this.request = 1;
       }
       this.received[1] = 1
    }
  },
},

mounted(){
  this.create0();
  this.create1();
  this.create2();
  this.create3();
},

template: `
          <div class="main">
            <div class="hidden" style="">
            </div>
            <div class="usualcenter infos">
              <div class="container">
                <div class="row">
                  <div class="col-lg-12">
                    <h1 class="txt-lt">Stats</h1>
                  </div>
                </div>
                <br>
                <div style="display: block; margin: 97px auto 250px;" :style="'display: ' + (request == 1 ? 'none' : 'block') + ';'" class="lds-roller">
			<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
		</div>
                <div :style="'display: ' + (request == 0 || (selected != void 0 && selected.length > 0) ? 'none' : 'flex') + ';'" style="display:None" class="row">
                  <div class="col-12 marge" style="height: inherit;">
                    <container name="Add your first device"
                               hover=true
                               style="height: 100%">
                               <ul>
                                <li v-if="testmod"><strike>Enable <b>test mod</b> in the nav bar</strike></li>
                                <li v-if="!testmod">Enable <b>test mod</b> in the nav bar</li>
                                <li>Go to <b>Map -> Devices</b></li>
                                <li>Click on <b>add a test device</b></li>
                              </ul>
                    </container>
                  </div>
                </div>
                <div :style="'display: ' + (request == 1 && selected != void 0 && selected.length > 0 ? 'flex' : 'none') + ';'" class="row">
                  <div class="col-xl-7 col-lg-12 col-sm-12 marge" style="height: inherit;">
                    <container note="Repartition of your devices by mark. Good > Medium > Bad, one step every 3.33 point"
                               name="Global stats"
                               hover=true
                               fullscreen=true
                               style="height: 100%">
                               <canvas id="globalbar" width="7" height="3" style="display: block; height: 200px; width: 100%;" class="chartjs-render-monitor"></canvas>
                    </container>
                  </div>
                  <div class="col-lg-5 col-sm-12 marge" style="height: inherit;">
                    <container name="Devices datas" hover=true style="height: 100%; min-height: 230px;">
                      <ul class='list-group col-12 sm-modalelist' style="overflow-x: hidden; height: calc(100% - 33px);">
                        <li v-for="point in data.proprietary" v-if="point.test == false || point.test == true" v-on:click="select([point.id, point.surname, point.data])" class="list-devices-stats list-group-item-action">
                          <div class="row">
                            <div class="ml-1 mr-0"style="text-align: left"> {{ point.surname }}</div>
                            <div v-if="selected[0] == point.id" class="ml-1 mr-0"style="text-align: left; color: #1C94FE"> &#10004</div>
                            <div v-if="point.data[0]" class="ml-auto mr-1 datelist"> Up. {{ point.data[0].date  | tostr }} min ago</div>
                            <div v-if="!point.data[0]" class="ml-auto mr-0 datelist"> No data </div>
                          </div>
                        </li>
                      </ul>
                    </container>
                  </div>

                  <div class="col-xl-5 col-lg-7 col-sm-12 marge" style="height: inherit;">
                  <container note="Your consomption for this month, it may take up to 10 hours to update"
                             :name="'24H - ' + (selected != void 0 && selected.length > 0 ? selected[1] : '') + ' score'"
                             hover=true style="height: 100%">
                             <canvas class="marge" id="chart1" width="5" height="3" style="display: block; height: 300px; width: 1000px;" class="chartjs-render-monitor"></canvas>
                  </container>
                  </div>
                  <div v-if="selected != void 0 && selected.length > 0" class="col-xl-7 col-sm-12 marge" style="height: inherit;">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               name="Current Consumption"
                               hover=true style="height: 100%">
                               <table style="width:100%">
                                <tr style="margin-bottom: 5px;">
                                  <th>Time</th>
                                  <th>Note</th>
                                  <th>PH</th>
                                  <th>Temperature</th>
                                  <th>Redox</th>
                                  <th>Turbidity</th>
                                </tr>
                                <br>
                                <tr v-for="data in selected[2]">
                                  <td><pre style="margin-bottom: 0">{{ data.date | tostr }} min ago</pre></td>
                                  <td><pre style="margin-bottom: 0">{{ data.data.data.note }}</pre></td>
                                  <td><pre style="margin-bottom: 0">{{ data.data.data.ph }}</pre></td>
                                  <td><pre style="margin-bottom: 0">{{ data.data.data.temp }}</pre></td>
                                  <td><pre style="margin-bottom: 0">{{ data.data.data.redox }}</pre></td>
                                  <td><pre style="margin-bottom: 0">{{ data.data.data.turbidity }}</pre></td>
                                </tr>
                              </table>
                                <div class="wc-button" style="width: 275px; margin-top: 20px;" v-on:click=reportlist> Reports for this device </div>
                    </container>
                  </div>
                  </div>
                  <div :style="'display: ' + (request == 1 && selected != void 0 && selected.length > 0 ? 'flex' : 'none') + ';'" class="row">
                  <div class="col-lg-12 col-sm-12 marge">
                    <container hover=false
                               border=false
                               style="height: 100%">
                                 <div class="row">
                                  <div class="col-md-6 col-lg-3" style="margin-bottom: 45px">
                                    <div class="wc-button"  v-on:click="change('ph')"> ph </div>
                                  </div>
                                  <div class="col-md-6 col-lg-3" style="margin-bottom: 45px">
                                    <div class="wc-button" v-on:click="change('turbidity')"> turbidity </div>
                                  </div>
                                  <div class="col-md-6 col-lg-3" style="margin-bottom: 45px">
                                    <div class="wc-button" v-on:click="change('temp')"> temp </div>
                                  </div>
                                  <div class="col-md-6 col-lg-3" style="margin-bottom: 45px">
                                    <div class="wc-button" v-on:click="change('redox')"> redox </div>
                                  </div>
                                </div>
                    </container>
                  </div>
                  <div class="col-lg-12 col-sm-12 marge">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               :name="'24H - ' + (selected != void 0 && selected.length > 0 ? selected[1] : '') + ' - ' + cap(received[0])"
                               hover=false
                               border=false
                               fullscreen=true
                               outside=true
                               style="height: 100%">
                                 <canvas class="marge" id="chart2" width="7" height="3" style="display: block; height: 300px; width: 1000px;" class="chartjs-render-monitor"></canvas>
                    </container>
                  </div>
                  <div class="col-lg-12 col-sm-12 marge">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               :name="'ALL - ' + (selected != void 0 && selected.length > 0 ? selected[1] : '') + ' - ' + cap(received[0])"
                               hover=false
                               border=false
                               fullscreen=true
                               outside=true
                               style="height: 100%">
                               <canvas class="marge" id="chart3" width="7" height="3" style="display: block; height: 300px; width: 1000px;" class="chartjs-render-monitor"></canvas>
                    </container>
                  </div>
                </div>
            </div>
          </div>
         `
}
