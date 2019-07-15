<template>
  <li class="listItem">
    <nuxt-link class="listItemLink" :to="to">
      <span class="iconContainer">
        <fa-icon class="iconContainer__icon" :icon="icon" />
      </span>

      {{name}}
    </nuxt-link>
  </li>
</template>

<script>
  export default {
    name: 'MenuItem',
    props: {
      icon: {
        type: Array,
        isRequired: true,
      },
      name: {
        type: String,
        isRequired: true,
      },
      to: String,
    }
  }
</script>

<style lang="scss" scoped>
.listItem {
  list-style-type: none;
  display: inline-block;
  margin-right: 1em;
}

.nuxt-link-active {
  color: #de1f24;

  .iconContainer {
    color: #f1f1f1;
    background-color: #de1f24;
  }
}

.listItemLink {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.iconContainer {
  width: 37px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #f1f1f1;
  background-color: #333;
  border-radius: 50%;
  margin-bottom: 5px;
}

</style>