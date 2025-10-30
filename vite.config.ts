import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// Plugin to replace HTML template placeholders with hardcoded values
function htmlEnvReplace(): Plugin {
  return {
    name: "html-env-replace",
    enforce: "pre",
    transformIndexHtml(html: string): string {
        // Hardcoded values for HTML template replacement
        const env = {
          VITE_APP_TITLE: "MyLinguaLearn",
          VITE_APP_LOGO: "/logo.png",
          VITE_ANALYTICS_ENDPOINT: "",
          VITE_ANALYTICS_WEBSITE_ID: "",
        };

        let transformed = html;

        // If analytics endpoint is not set, remove the analytics script BEFORE replacement
        // This prevents routing issues with malformed URLs like /article/%VITE_ANALYTICS_ENDPOINT%/umami
        if (!env.VITE_ANALYTICS_ENDPOINT || !env.VITE_ANALYTICS_WEBSITE_ID) {
          // Remove analytics script - match multiline script tag (dotall flag /s matches newlines)
          transformed = transformed.replace(
            /<script\s+defer\s+src="%VITE_ANALYTICS_ENDPOINT%\/umami"\s+data-website-id="%VITE_ANALYTICS_WEBSITE_ID%">\s*<\/script>/s,
            ""
          );
        }

        // Replace all %VITE_*% placeholders
        Object.entries(env).forEach(([key, value]) => {
          const regex = new RegExp(`%${key}%`, "g");
          transformed = transformed.replace(regex, value);
        });

        // Clean up any remaining empty scripts (fallback safety)
        transformed = transformed.replace(
          /<script\s+defer[^>]*src=""[^>]*data-website-id=""[^>]*>\s*<\/script>/,
          ""
        );

        return transformed;
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), htmlEnvReplace()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
