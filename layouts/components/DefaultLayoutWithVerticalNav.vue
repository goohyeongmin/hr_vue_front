





<script lang="ts" setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'
import AccNav from './AccNav.vue'
import HRNav from './HRNav.vue'
import LogiNav from './LogiNav.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
defineProps<{ navMenu: any}>()

// import { useUserStore } from '@/store/hr/affair'

// const userStore = useUserStore()

// const showMessage = (msg : string, type:'error'| 'success' |'info') => {
//   alert(msg)
// }

// const handleAttendanceMenuClick = () =>{
//   if(userStore.inOutSide !== 'i'){
//     showMessage('일근태 달력에 접근할 권한이 없습니다.','error')
//     return
//   }
// }



</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn id="vertical-nav-toggle-btn" class="ms-n3 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon size="26" icon="tabler-menu-2" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig" />
        <HRNav class="mr-3" />
        <LogiNav class="mr-3" />
        <AccNav class="mr-3" />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
