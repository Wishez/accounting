export function setPagination(incrementValue = 1, inrcerementName = 'pageNumber') {
  const { pagination } = this.$refs
  if (pagination) {
    const showMoreItems = (entries) => {
      if (entries[0].isIntersecting) this[inrcerementName] += incrementValue
    }
    const observer = new IntersectionObserver(showMoreItems, {
      threshold: 0,
    })
    observer.observe(pagination)
  } else setTimeout(() => setPagination.call(this), 1500)
}
