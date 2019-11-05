<template>
  <div
    :class="{ 
      dropdown: true,
      fieldContainer_inline: isInline,
    }"
  >
    <label v-if="labelText" :for="`${name}Input`" :id="`${name}Label`">
      {{labelText}}
    </label>
    <input class="dropdown-input"
      v-model="searchFilter"
      :name="name"
      :id="`${name}Input`"
      :aria-describedby="`${name}Label`"
      :disabled="disabled"
      :placeholder="placeholder"
      :required="isRequired"
      autocomplete="off"
      @focus="showOptions()"
      @blur="exit()"
      @keyup="keyMonitor"
    />
    
    <transition name="fadeTranslateToBottom">
      <div
        :class="{
          'dropdown-content': true,
          'dropdown-content_with-label': labelText,
        }"  
        v-if="isOptionsShown"
      >
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
      labelText: String,
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
      defaultValue: Object,
      isInline: Boolean,
      filterValue: Object,
      withFilter: Boolean,
    },

    updated() {
      if (this.withFilter && this.selected.id && !this.filterValue.id) this.selectOption({})
    },

    data() {
      return {
        isOptionsShown: false,
        searchFilter: '',
        selected: {},
      }
    },

    mounted() {
      const { name } = this.defaultValue || {}
      if (name) {
        this.searchFilter = name
        this.selected = this.defaultValue
      }
  
      this.$emit('selected', this.selected);
    },

    computed: {
      filteredOptions() {
        const { searchFilter, options } = this
        if (searchFilter.length < 1) return options

        const regOption = new RegExp(this.searchFilter, 'ig');
        const filteredOptions = [];
        for (const option of options) {
          if (option.name.match(regOption)) filteredOptions.push(option)
        }

        return filteredOptions
      },
    },

    methods: {
      selectOption(option) {
        this.selected = option;
        this.isOptionsShown = false;
        this.searchFilter = this.selected.name || '';
        this.$emit('selected', this.selected);
      },
      showOptions(){
        if (!this.disabled) {
          this.searchFilter = ''
          this.isOptionsShown = true;
        }
      },
      exit() {
        this.searchFilter = this.selected.name
        this.isOptionsShown = false
        this.$forceUpdate()
      },
      // Selecting when pressing Enter  
      keyMonitor: function(event) {
        if (event.key === "Enter" && this.filteredOptions[0])
          this.selectOption(this.filteredOptions[0]);
      }
    },
    watch: {
      searchFilter() {
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
    width: 100%;
    margin-top: 45px;
    max-height: 45px * 5;
    position: absolute;
    top: 0;
    left: 0;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid   #333;
    box-shadow: 0px 9px 15px 0px rgba(0, 0, 0, 0.2);
    z-index: 10;

    @media (--from-tablet) {
      
      &::-webkit-scrollbar {
        width: .5em
      }
  
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
  
      &::-webkit-scrollbar-thumb {
        background-color: #1F2229;
        border-radius: 25px;
      }
    }


    &_with-label {
      margin-top: 66px;
    }
  }
</style>
