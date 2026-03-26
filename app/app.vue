<template>
  <div class="min-h-screen bg-stone-950 text-stone-50">
    <NuxtRouteAnnouncer />
    <main class="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-24">
      <section class="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div class="space-y-6">
          <p class="text-sm uppercase tracking-[0.35em] text-emerald-300/80">
            Hiraya
          </p>
          <h1 class="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Nuxt 4 with Tailwind v4 is wired into this project.
          </h1>
          <p class="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Start building from a clean Nuxt app shell with the official Tailwind module and a global stylesheet under
            <code class="rounded bg-stone-900 px-2 py-1 text-sm text-emerald-300">app/assets/css/main.css</code>.
          </p>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div class="grid gap-4 text-sm text-stone-300">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Nuxt</span>
              <span class="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-300">Ready</span>
            </div>
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <span>Tailwind v4</span>
              <span class="rounded-full bg-sky-400/15 px-3 py-1 text-sky-300">Configured</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Global CSS</span>
              <span class="rounded-full bg-amber-400/15 px-3 py-1 text-amber-300">Loaded</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
