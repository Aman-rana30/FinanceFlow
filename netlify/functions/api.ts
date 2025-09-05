import serverless from "serverless-http";

import { createServer } from "../../server";

// Ensure Express routes work behind Netlify function base path
export const handler = serverless(createServer(), {
  basePath: "/.netlify/functions/api",
});
