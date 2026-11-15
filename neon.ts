import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: false,
  // Product photos. Public so the website can show them without signed links;
  // only the signed-in admin can upload (see app/api/upload/route.ts).
  buckets: {
    "product-images": { access: "public_read" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) return {};
    if (!branch.exists) return { ttl: "7d" }; // new non-default branches auto-expire
    return {};
  },
});
