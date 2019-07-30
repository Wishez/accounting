<template>
  <div class="dropdown" v-if="options">
    <input class="dropdown-input"
      :name="name"
      @focus="showOptions()"
      @blur="exit()"
      @keyup="keyMonitor"
      v-model="searchFilter"
      :disabled="disabled"
      :placeholder="placeholder"
      :required="isRequired"
      autocomplete="off"
    />
    
    <transition name="fadeTranslateToBottom">
      <div class="dropdown-content" v-if="isOptionsShown">
        <div
          class="dropdown-item"
          v-for="(option, index) in filteredOptions"
          :key="index"
          @mousedown="selectOption(option)"
        >
          {{ option.name || option.id || '-' }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'BaseDropdown',
    props: {
      name: {
        type: String,
        required: false,
        default: 'dropdown',
        note: 'Input name'
      },
      options: {
        type: Array,
        required: true,
        default: () => ([]),
        note: 'Options of dropdown. An array of options with id and name',
      },
      isRequired: {
        type: Boolean,
        default: true,
      },
      placeholder: {
        type: String,
        required: false,
        default: 'Please select an option',
        note: 'Placeholder of dropdown'
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
        note: 'Disable the dropdown'
      },
      maxItem: {
        type: Number,
        required: false,
        default: 6,
        note: 'Max items showing'
      },
      defaultValue: Object,
    },
    data() {
      return {
        isOptionsShown: false,
        searchFilter: '',
        selected: {},
      }
    },
    created() {
      const { name } = this.defaultValue || {}
      if (name) {
        this.searchFilter = name
        this.selected = this.defaultValue
      }
  
      this.$emit('selected', this.selected);
    },
    computed: {
      filteredOptions() {
        const filtered = [];
        const regOption = new RegExp(this.searchFilter, 'ig');
        for (const option of this.options) {
          if (this.searchFilter.length < 1 || option.name.match(regOption)){
            if (filtered.length < this.maxItem) filtered.push(option);
          }
        }
        return filtered;
      },
    },

    methods: {
      selectOption(option) {
        this.selected = option;
        this.isOptionsShown = false;
        this.searchFilter = this.selected.name;
        this.$emit('selected', this.selected);
      },
      showOptions(){
        if (!this.disabled) {
          this.searchFilter = '';
          this.isOptionsShown = true;
        }
      },
      exit() {
        this.isOptionsShown = false;
      },
      // Selecting when pressing Enter
      keyMonitor: function(event) {
        if (event.key === "Enter" && this.filteredOptions[0])
          this.selectOption(this.filteredOptions[0]);
      }
    },
    watch: {
      searchFilter() {
        if (this.filteredOptions.length === 0) {
          this.selected = {};
        } else {
          this.selected = this.filteredOptions[0];
        }
        this.$emit('filter', this.searchFilter);
      }
    }
  };
</script>


<style lang="scss" scoped>
  .dropdown {
    position: relative;
    width: 100%;
  }

  .dropdown-item {
    color: #333;
    padding: .75em;
    text-decoration: none;
    display: block;
    cursor: pointer;
    transition: 200ms;

    &:hover {
      background-color: #f1f1f1;
    }
  }

  .dropdown-content {
    margin-top: -22px;
    width: 100%;
    max-height: 45px * 5;
    position: absolute;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid   #333;
    box-shadow: 0px 9px 15px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
</style>
