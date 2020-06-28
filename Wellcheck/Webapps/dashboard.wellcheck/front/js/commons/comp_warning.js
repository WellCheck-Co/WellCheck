let warning = {
  data: function() {
    return {}
  },
  props: {display: {default: false}, note: {default: void 0}},
  template: `
    <div class="note">
      <svg v-if="display" class="warning" viewBox="0 0 24 24">
        <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z">
        </path>
      </svg>
      <span v-if="note != void 0" class="notetext notewarning">
        {{ note }}
      </span>
    </div>
    `
}
