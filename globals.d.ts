/* Side-effect CSS imports carry no types of their own; without this the
 * compiler rejects `import "./preview.css"` outright. */
declare module "*.css";
