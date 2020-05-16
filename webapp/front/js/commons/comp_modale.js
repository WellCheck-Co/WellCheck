let mod = {
  data: function() {
    return {
      type: 'hide',
      open: false,
      name: null,
      comp: null,
      page: localStorage.location.slice(1),
      data: '',
      note: null,
      warning: false
    }
  },
  components: { warning },
  filters: {
    removeunder: function(str = ''){
      return str == void 0 ? str : str.replace(/_/g, ' ')
    }
  },
  methods: {
    changeopen: function(name) {
      if (name == this.name || this.name == null) {
        this.open = !this.open;
        this.change()
      }
      if (this.open) {
        this.name = name
        this.comp = 'compMod' + name;
        this.$nextTick(function () {
        if (this.$refs.inside.update != void 0){
          this.$refs.inside.update();
        }
      })
      }

    },
    loaddata: function(data) {
      this.data = JSON.parse(JSON.stringify(data));
      if (data != void 0 && data.note != void 0)
        this.note = data.note;
      if (data != void 0 && data.warning != void 0)
        this.warning = data.warning;

    },
    open: function() {
      this.open = true;
      this.change()
    },
    nothing: function(event){
      event.stopPropagation();
    },
    close: function() {
      const e = document.getElementById("modale");
      e.classList.add('smooth2');
      this.step = 2;
      e.addEventListener("animationend", (ev) => {
        if (ev.type === "animationend") {
          e.classList.remove('smooth2');
          this.open = false;
          this.change();
        }
      }, false);

    },
    change: function() {
      this.data = ''
      this.warning = false;
      this.note = null;
      let id = "vue" + this.page;
      let doc = document.getElementById(id);
      if (this.open) {
        this.type = '';
        doc.classList.add('blur');
      }
      else {
        this.type = 'hide';
        this.name = null;
        doc.classList.remove('blur');
        vm.$refs.nav.disableall();
      }
    }
  },
  template: `
  <div id="modale" class='back' :class='type' v-on:click=close>
    <div class='base' v-on:click="nothing(event)">

      <div class='title-base'>
        <warning :display=warning note="Oops, it look's like you got difficulties loading this item"></warning>
         {{ this.name | removeunder}}
         <div v-if="note != void 0" class="note-cont note">
           <svg viewBox="0 0 24 24">
            <path class="" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z">
            </path>
           </svg>
           <span class="notetext">
            {{ note }}
           </span>
        </div>
        <div id="cross" class="cross modalecross"  v-on:click=close>╳</div>
      </div>
      <component ref="inside" :data=this.data v-bind:is=this.comp></component>
    </div>
  </div>
  `
  }
