import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "blank" | "components-acc-nav" | "components-default-layout-with-horizontal-nav" | "components-default-layout-with-vertical-nav" | "components-footer" | "components-hr-nav" | "components-logi-nav" | "components-nav-bar-notifications" | "components-nav-search-bar" | "components-navbar-shortcuts" | "components-navbar-theme-switcher" | "components-user-profile" | "default"
declare module 'nuxt/app' {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}