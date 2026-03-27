<template>
  <ClientOnly>
    <UColorModeButton
      color="neutral"
      variant="ghost"
      size="sm"
      :ui="{
        base: 'rounded-full border border-default bg-default/90 shadow-sm backdrop-blur-sm'
      }"
    />

    <template #fallback>
      <div class="size-8 rounded-full border border-default bg-default/80" />
    </template>
  </ClientOnly>
</template>
