/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIST_ID: string;
  readonly VITE_ENCRYPTED_PAT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
