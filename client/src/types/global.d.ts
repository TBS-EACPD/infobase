/* eslint-disable no-unused-vars */
//Not sure why all these declaration are considered unused

declare const IS_A11Y_MODE: boolean | undefined;
declare const IS_DEV_LINK: boolean | undefined;
declare const IS_CI: boolean | undefined;
declare const IS_DEV: boolean | undefined;

declare type LangType = "en" | "fr";

declare const APPLICATION_LANGUAGE: LangType | undefined;
declare const SHA: string | undefined;
declare const PREVIOUS_DEPLOY_SHA: string | undefined;
declare const BUILD_DATE: string | undefined;
declare const CDN_URL: string | undefined;
declare const LOCAL_IP: string | undefined;

interface Window {
  __DEV: Object;
}
