
// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import { VCalendar } from 'vuetify/labs/VCalendar'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...components,
      VCalendar, // ✅ 달력 등록
    },
    directives,
  })

  nuxtApp.vueApp.use(vuetify)
})
