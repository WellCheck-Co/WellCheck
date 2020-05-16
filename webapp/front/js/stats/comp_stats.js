let stats = {
data: function() {
  return {
    limit: 0,
    selected: [],
    charts: {"chart1": null, "chart2": null, "chart3": null},
    received: ["ph", 0]
  }
},

components: {container, warning},

props: {data: {default: void 0}},

watch:{
  data:function(newd, oldd){
    if (oldd == "" && this.selected.length == 0){
      var i;
      var arr = []
      if (this.data["proprietary"].length > 0){
        i =  this.data["proprietary"][0]
        arr = [i.id, i.surname, i.data]
      } else if (this.data["shared"].length > 0){
        i =  this.data["shared"][0]
        arr = [i.id, i.surname, i.data]
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
    return min
  }
},

methods: {
  select: function(arr){
    this.selected = arr
    this.infos(arr[0]);
  },
  create0: function(){
    var barChartData = {
			labels: ['Good', 'Medium', 'Bad'],
			datasets: [{
				label: 'Test',
				backgroundColor: '#ff970f',
				data: [
					1,
					2,
					0,
				]
			}, {
				label: 'Your\'s',
				backgroundColor:'#1C94FE',
				data: [
					1,
					0,
					2,
				]
			}, {
				label: 'Shared with you',
				backgroundColor: '#79befa',
				data: [
					3,
					5,
					1,
				]
			}]

		};
			var ctx = document.getElementById('globalbar').getContext('2d');
			var gloabalbar = new Chart(ctx, {
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
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var color = Chart.helpers.color;
    var timeFormat = 'MM/DD/YYYY HH:mm';

      var ctx = document.getElementById('chart1').getContext('2d');
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

		var ctx = document.getElementById('chart2').getContext('2d');
		this.charts["chart2"] = new Chart(ctx, config);

  },

  create3: function(){
		var ctx = document.getElementById('chart3').getContext('2d');

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


  infos: function(id) {
    let data = {}
    data['headers'] = cred.methods.get_headers()
    data['data'] = {
    	"id_point": id,
    	"datas": [this.received[0]]
    }
    this.received[1] = 0
    if (id != void 0)
      user.methods.send('point/graph', data, this.store);
  },

  store: function(data) {
    if (data != '') {
      console.log(data, this.charts);
       this.charts["chart1"].config.data.labels = data["chart1"]["data"]["label"];
       this.charts["chart1"].update();
       this.charts["chart1"].config.data.datasets[0].data = data["chart1"]["data"]["data"];
       this.charts["chart1"].update();
       this.charts["chart2"].config.data.datasets[2].data = data["chart2"][this.received[0]]["data"];
       this.charts["chart2"].config.data.datasets[0].data = [{
         x: data["chart2"]["ph"]["limits"]["y"]["min"],
         y: data["chart2"]["ph"]["limits"]["opt"]["low"]
       }, {
         x: data["chart2"]["ph"]["limits"]["y"]["max"],
         y: data["chart2"]["ph"]["limits"]["opt"]["low"]
       }];
       this.charts["chart2"].config.data.datasets[1].data = [{
         x: data["chart2"]["ph"]["limits"]["y"]["min"],
         y: data["chart2"]["ph"]["limits"]["opt"]["high"]
       }, {
         x: data["chart2"]["ph"]["limits"]["y"]["max"],
         y: data["chart2"]["ph"]["limits"]["opt"]["high"]
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
                <div class="row">

                  <div class="col-lg-8 col-sm-12 marge" style="height: inherit;">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               name="Global stats"
                               hover=true
                               fullscreen=true
                               style="height: 100%">
                               <canvas id="globalbar" width="7" height="3" style="display: block; height: 200px; width: 100%;" class="chartjs-render-monitor"></canvas>
                    </container>
                  </div>
                  <div class="col-lg-4 col-sm-12 marge" style="height: inherit;">
                    <container name="Devices datas" hover=true style="height: 100%">
                      <ul class='list-group col-12 sm-modalelist' style="overflow-x: hidden; height: calc(100% - 33px);">
                        <li v-for="point in data.proprietary" v-if="point.test == false || point.test == true" v-on:click="select([point.id, point.surname, point.data])" class="list-devices-stats list-group-item-action">
                          <div class="row">
                            <div class="ml-1 mr-0"style="text-align: left"> {{ point.surname }}</div>
                            <div v-if="selected[0] == point.id" class="ml-1 mr-0"style="text-align: left; color: #1C94FE"> &#10004</div>
                            <div v-if="point.data[0]" class="ml-auto mr-1 datelist"> Up. {{ point.data[0].date  | tostr }} min ago</div>
                            <div v-if="!point.data[0]" class="ml-auto mr-1 datelist"> No data </div>
                          </div>
                        </li>
                      </ul>
                    </container>
                  </div>
                  </div>
                  <div class="row">
                  <div class="col-lg-5 col-sm-12 marge" style="height: inherit;">
                  <container note="Your consomption for this month, it may take up to 10 hours to update"
                             :name="'24H - ' + selected[1] + ' score'"
                             hover=true style="height: 100%">
                             <canvas class="marge" id="chart1" width="5" height="3" style="display: block; height: 300px; width: 1000px;" class="chartjs-render-monitor"></canvas>
                  </container>
                  </div>
                  <div class="col-lg-7 col-sm-12 marge" style="height: inherit;">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               name="Current Consumption"
                               hover=true style="height: 100%">
                               <table style="width:100%">
                                <tr>
                                  <th>Time</th>
                                  <th>Note</th>
                                  <th>PH</th>
                                  <th>Temperature</th>
                                  <th>Redox</th>
                                  <th>Turbidity</th>
                                </tr>
                                <tr v-for="data in selected[2]">
                                  <td>{{ data.date | tostr }} min ago</td>
                                  <td>{{ data.data.data.note }}</td>
                                  <td>{{ data.data.data.ph }}</td>
                                  <td>{{ data.data.data.temp }}</td>
                                  <td>{{ data.data.data.redox }}</td>
                                  <td>{{ data.data.data.turbidity }}</td>
                                </tr>
                              </table>
                    </container>
                  </div>
                  </div>
                  <div class="row">
                  <div class="col-lg-12 col-sm-12 marge">
                    <container note="Your consomption for this month, it may take up to 10 hours to update"
                               :name="'24H - ' + selected[1] + ' - PH'"
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
                               :name="'ALL - ' + selected[1] + ' - PH'"
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
