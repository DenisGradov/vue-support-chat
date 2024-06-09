<template>
  <div>
  </div>
</template>

<script>

export default {
  methods: {
    onEmojiClick(event) {
      this.$emit('emoji-selected', event.detail.unicode);
    }
  },
}
</script>

<style lang="scss" scoped>
  div{
    width: 200px;
  }
</style>