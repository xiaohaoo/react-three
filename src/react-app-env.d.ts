/// <reference types="react-scripts" />
declare module "*.less";
declare module "*.scss";
declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.module.less" {
    const classes: { readonly [key: string]: string };
    export default classes;
}
