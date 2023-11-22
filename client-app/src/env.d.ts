/// <reference types="vite/client" />

//Vite force us to be call ImportMetaEnv
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CHAT_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
