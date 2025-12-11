/**
 * Netlify Edge Functions server entry point.
 * This file replaces entry.server.tsx during Netlify builds and
 * exports from the virtual module provided by @netlify/vite-plugin-react-router.
 *
 * @see https://docs.netlify.com/frameworks/react-router#deploying-to-edge-functions
 */
// @ts-expect-error - Virtual module provided by @netlify/vite-plugin-react-router
export { default } from "virtual:netlify-server-entry";
