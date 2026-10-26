import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page depends on the session (dynamic rendering): no incremental cache needed.
export default defineCloudflareConfig({});
