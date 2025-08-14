/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __USE_MOCK_ROUTER__?: boolean
  }
  
  var __USE_MOCK_ROUTER__: boolean | undefined
}