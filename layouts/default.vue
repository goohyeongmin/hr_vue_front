<script lang="ts" setup>
import { useConfigStore } from '@core/stores/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
// import { useUserStore } from '@/store/hr/affair'
// import { computed } from 'vue'

// const userStore = useUserStore()
const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithVerticalNav.vue'))

const configStore = useConfigStore()

// const navMenu = computed(() => {
//   if (!userStore.inOutSide) return [] // 아직 유저 정보 없음

//   return [
//     {
//       title: '근태관리',
//       icon: { icon: 'tabler-alarm' },
//       children: [
//         {
//           title: '일근태관리',
//           to: { name: 'hr-attndmgmt-daily' },
//           disable: userStore.inOutSide !== 'i', // i가 아니면 비활성
//         },
//       ],
//     },
//   ]
// })


// ℹ️ This will switch to vertical nav when define breakpoint is reached when in horizontal nav layout
// Remove below composable usage if you are not using horizontal nav layout in your app
switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()

injectSkinClasses()
</script>

<template>
  <Component
    v-bind="layoutAttrs"
    :is="configStore.appContentLayoutNav === AppContentLayoutNav.Vertical ? DefaultLayoutWithVerticalNav : DefaultLayoutWithHorizontalNav"
    >
    <slot />
  </Component>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";
</style>
