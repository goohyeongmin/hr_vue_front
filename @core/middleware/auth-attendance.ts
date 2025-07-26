

// import { useUserStore } from '@/store/hr/affair'

// export default defineNuxtRouteMiddleware((to, from) => {
//   const userStore = useUserStore()

//   if (to.meta.requiresInSide && userStore.inOutSide !== 'i') {

//             alert('일근태 달력에 접근할 권한이 없습니다.')
//                 return navigateTo('/')
//   } 
// }) 

// import { useUserStore } from '@/store/hr/affair'

// export default defineNuxtRouteMiddleware((to, from) => {
//   const userStore = useUserStore()

//   // if (to.meta.requiresInSide && userStore.inOutSide !== 'i') {
//     if (to.name === 'hr-attndmgmt-daily' && userStore.inOutSide !== 'i') {
//             alert('일근태 달력에 접근할 권한이 없습니다.')
//                 return navigateTo('/')
//   } 
// }) 


// import { useUserStore } from '@/store/hr/affair'

// export default defineNuxtRouteMiddleware((to, from) => {
//   const userStore = useUserStore()
  
//   // 디버깅용 로그
//   console.log('미들웨어 - 현재 사용자 inOutSide:', userStore.inOutSide)
//   console.log('미들웨어 - 접근하려는 페이지:', to.name)
  
//   // 일근태관리 페이지 접근 시 권한 체크
//   if (to.name === 'hr-attndmgmt-daily' && userStore.inOutSide !== 'i') {
//     console.log('접근 거부 - inOutSide:', userStore.inOutSide)
//     alert('일근태 달력에 접근할 권한이 없습니다.')
    
//     // 페이지 접근을 실제로 막기
//     return navigateTo('/')  // 메인 페이지로 리다이렉트
//   }

//   // meta.requiresInSide를 사용하는 경우
//   if (to.meta.requiresInSide && userStore.inOutSide !== 'i') {
//     console.log('meta 권한 체크 실패 - inOutSide:', userStore.inOutSide)
//     alert('해당 페이지에 접근할 권한이 없습니다.')
//     return navigateTo('/')
//   }
// })