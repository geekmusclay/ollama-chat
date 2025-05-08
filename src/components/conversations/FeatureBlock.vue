<template>
  <div class="feature">
    <div class="feature-icon">
      <slot name="icon"></slot>
    </div>
    <div class="feature-text">
      <slot name="title"></slot>
      <slot name="description"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureBlock',
};
</script>

<style scoped>
.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--background-color);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.feature-text p {
  font-size: 14px;
  color: var(--secondary-color);
  line-height: 1.4;
}
</style>
