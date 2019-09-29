<template>
  <section class="container">
    <h1 v-if="error.statusCode === 404" class="placeholder__title">Страница не найдена</h1>
    <h1 v-else class="placeholder__title">Что-то пошло не так. Попробуйте зайти на эту страницу позже.</h1>
    <div class="placeholder">
      <div class="actions_near litter">
        <nuxt-link to="/" class="action-button link">На главную</nuxt-link>
      </div>
      <img :src="placeholder" alt="placeholder" class="placeholder__image">
    </div>
  </section>
</template>

<script>
import placeholder from '~/assets/cat.jpeg'
export default {
  name: "StatisticsPage",
  props: ['error'],
  data: () => ({
    placeholder
  })
}
</script>
