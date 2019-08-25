<template>
  <section class="container">
    <h1 class="placeholder__title">Статистика</h1>
    <div class="placeholder">
      <p class="placeholder__text">Здесь можно бует выгрузить статистику транзакций определённого счёта, определённого типа транзакции, за определённый период.</p>
      <img :src="placeholder" alt="placeholder" class="placeholder__image">
    </div>
  </section>
</template>

<script>
import placeholder from '~/assets/cat.jpeg'
export default {
  name: "StatisticsPage",

  data: () => ({
    placeholder
  })
}
</script>

<style lang="scss" scoped>
.placeholder {
  max-width: 60ch;
  margin: auto;

  &__title {
    text-align: center;
  }
}
</style>

