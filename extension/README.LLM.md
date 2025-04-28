# Extension Setup Summary (for LLM)

This document summarizes the setup for the Chrome Extension located in the `extension` directory.

## Core Structure & Technologies

*   **Project Root:** The Node.js project (`package.json`, `node_modules`) is located *within* the `extension` directory itself.
*   **Source Code:**
    *   `content.js`: Main content script, uses ES modules (`import`/`export`) to load platform-specific logic.
    *   `controllers/`: Contains separate `.js` files for platform-specific logic (Twitter, Reddit, LinkedIn, ChatGPT), exported as functions.
    *   `background.js`: Background service worker script.
    *   `popup/`: Contains files for the extension popup UI.
    *   `assets/`: Contains static assets like icons.
    *   `manifest.json`: The extension manifest file (source version).
*   **Modules:** ES Modules (`import`/`export`) are used in `content.js` and the controller files. This necessitates a build step for the content script.

## Build Process (Vite)

*   **Tool:** Vite is used as the build tool.
*   **Configuration:** `extension/vite.config.js` handles the build setup.
*   **Dependencies:** Uses `vite-plugin-static-copy` to copy non-bundled assets.
*   **Entry Points:**
    *   `extension/content.js`
    *   `extension/background.js`
*   **Output Directory:** `extension/dist`
*   **Output Format:** Bundles are generated in `esm` format.
*   **Static Assets:** `manifest.json`, `popup/`, and `assets/` are copied directly to the `dist` folder by `vite-plugin-static-copy`.
*   **Manifest Update:** The source `manifest.json` is configured to point to the *bundled* output files (`content.bundle.js`, `background.bundle.js`). This manifest is then copied to `dist` during the build.
*   **Build Command:** `npm run build` (executed from within the `extension` directory).

## Result

The `npm run build` command creates a self-contained `extension/dist` directory. This `dist` folder includes:

*   Bundled JavaScript (`content.bundle.js`, `background.bundle.js`).
*   The correctly configured `manifest.json`.
*   Copied `popup` and `assets` directories.

This `extension/dist` folder is ready to be loaded directly into Chrome using the "Load unpacked" feature.
