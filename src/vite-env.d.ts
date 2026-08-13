/// <reference types="vite/client" />

//import css
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}