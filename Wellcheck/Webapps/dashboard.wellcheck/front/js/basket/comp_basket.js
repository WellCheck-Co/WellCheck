let stats = {
    data: function() {
        return {
          prices: {
              "device": 249,
              "subscription": 10
          }
        }
    },

    components: {container, warning},
    
    props: {data: {default: void 0}},
    
    methods: {
        handleChanges: function() {
            $("#number").on("change", (event) => {
                $("#numberSpan").text(event.target.value);
                $("#devicesPrice").text(event.target.value * this.prices.device);
                $("#subscriptionPrice").text(event.target.value * this.prices.subscription);
                $("#buyButton").attr("disabled", event.target.value <= 0);
            });
            $("#buyButton").on("click", () => {
                alert("You just bought " + $("#number").val() + " devices !");
            });
        }
    },
    
    mounted(){
        this.handleChanges();
    },
    
    template: `
              <div class="main">
                <div class="hidden" style="">
                </div>
                <div class="usualcenter infos">
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-12">
                        <h1 class="txt-lt">Basket</h1>
                      </div>
                    </div>
                    <br>
                    <div class="marge" style="height: inherit;">
                        <container note="Your basket"
                                    name="My basket"
                                    hover=true
                                    style="height: 100%">
                                    <div class="row justify-content-md-center">
                                        <label class="col-md-4">Number of devices</label>
                                        <input id="number" type="range" class="custom-range col-md-6" min="0" max="10" value="0">
                                        <span id="numberSpan" class="col-md-2">0</span>
                                    </div>
                                    <br>
                                    <span>249€ / device + 10€ / month / device</span>
                                    <br><br>
                                    <span><span id="devicesPrice">0</span>€ now + <span id="subscriptionPrice">0</span>€ / month</span>
                                    <br><br>
                                    <button id="buyButton" type="button" class="btn btn-primary col-md-4" disabled>Buy</button>
                        </container>
                    </div>
                </div>
              </div>
             `
    }
    