/* eslint-disable no-unused-vars */

// Global types:
type LangType = "en" | "fr";
interface LangDict<T> {
  en: T;
  fr: T;
}
interface Window {
  __DEV: Record<string, unknown>;
}

// Global variables injected by webpack

const IS_A11Y_MODE: boolean | undefined;
const IS_DEV_LINK: boolean | undefined;
const IS_CI: boolean | undefined;
const IS_DEV: boolean | undefined;

const APPLICATION_LANGUAGE: LangType | undefined;
const SHA: string | undefined;
const PREVIOUS_DEPLOY_SHA: string | undefined;
const BUILD_DATE: string | undefined;
const CDN_URL: string | undefined;
const LOCAL_IP: string | undefined;
