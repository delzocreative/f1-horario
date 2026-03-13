# Cloudflare Pages Configuration

/*
 * Configuration for deploying F1 Dashboard LATAM to Cloudflare Pages
 */

// Build configuration for Cloudflare Pages
const cfPagesConfig = {
    name: "f1-dashboard-latam",
    buildCommand: "", // No build needed for static site
    destinationDir: ".", // Root directory
    rootDir: "./", 
    outputConf: "single-page-application", // SPA routing
    
    // Environment settings
    env: {
        NODE_VERSION: "18.x", // or 16.x depending on compatibility needs
    },
    
    // Functions not needed (SPA)
    functionsDir: null,
    
    // Assets
    assets: {
        version: "v1.0.0", // This can be updated as needed
        include: ["**/*"],
        exclude: [".git/", "node_modules/", ".github/"]
    }
};

// Routes that should be served as index.html (SPA setup) 
const customRoutes = {
    // Handle client-side routing by returning index.html
    spaFallback: [
        "/schedule",
        "/standings",
        "/historical",
        "/race/*",
        "/driver/*",
        "/constructor/*"
    ]
};

// Optional custom headers for enhanced security and performance
const securityHeaders = {
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "geolocation=(), microphone=(), camera=()"
};

console.log("✅ Cloudflare Pages configuration ready");
console.log("- Project:", cfPagesConfig.name);
console.log("- Build type: Static site (no build step needed)");
console.log("- Router: SPA fallback configured");
console.log("- Ready for deployment via GitHub integration");