<template>
  <section class="container">
    <h1>Счета</h1>

    <ul>
      <li v-for="(account, index) in accounts.data" :key="index">
        <h2>{account.name}</h2>
      </li>
    </ul>
  </section>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    accounts: gql`
      query {
        accounts {
          data {
            id
            color
            name
          }
        }
      }
    `
  },
  mounted() {
    console.log(this.accounts.data)
  },
}
</script>

<style>

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

