let container = {
  data: function() {
    return {
    }
  },

  props: {name: {default: ''}, hover: {default: false}, warning: {default: false}, note: {default: void 0}, fullscreen: {default: false}, outside: {default: false}, border: {default: true}},
  components: { warning },
  methods: {
    display: function(){
    },
    full: function(){
      if (document.querySelector(".main")) {
        document.querySelector(".main").style.overflow = "visible"
        document.querySelector(".main").style.height= "100px";
      }
      if (this.$el.style.position == "absolute")
        return this.close()
      var a = this.$el, b = 0, c = 0;
      while (a) {
          b += a.offsetLeft;
          c += a.offsetTop;
          a = a.offsetParent;
      }
        b -= 2;
        c += 2;
      this.$el.style.transition = "0s";
      this.$el.style.position = "absolute";
      if (this.outside + "" == 'true'){
        c += 3;
      }
      this.$el.style.left = "-" + b + "px";
      this.$el.style.top = "-" + c + "px";
      this.$el.style.height = "100vh";
      this.$el.style.width = "calc(100vw + 15px)";
      this.$el.style.zIndex = "2";
      this.$el.style.borderRadius = "unset";
      window.addEventListener('resize', this.close);
    },
    close: function(){
      if (document.querySelector(".main")) {
        document.querySelector(".main").style.overflow = "";
        document.querySelector(".main").style.height= "";
      }
      window.removeEventListener('resize', this.close);
      this.$el.style.transition = "";
      this.$el.style.position = "";
      this.$el.style.left = "";
      this.$el.style.top = "";
      this.$el.style.height = "100%";
      this.$el.style.width = "";
      this.$el.style.zIndex = "";
      this.$el.style.borderRadius = "";
    }
  },

  template:`
  <div class='cont' :class="this.hover + '' == 'true' ? 'cont-hover' : ''" :style="this.border + '' != 'true' ? 'border: none' : ''">
    <div v-if="this.fullscreen + '' == 'true'" v-on:click="full()" style="position: static; margin-top: -18px; margin-left: calc(100% - -1px); cursor: pointer;font-size: 0.8rem">╳</div>
    <div class='title-cont'>
       <warning :display=warning note="Oops, it look's like you got difficulties loading this item"></warning>
       {{ this.name }}
       <div v-if="note != void 0" class="note-cont note">
         <svg viewBox="0 0 24 24">
          <path class="" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z">
          </path>
         </svg>
         <span class="notetext">
          {{ note }}
         </span>
        </div>

    </div>

    <slot>
    </slot>
  <div>`
}
