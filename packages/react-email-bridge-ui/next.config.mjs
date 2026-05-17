/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  serverExternalPackages: ['esbuild'],
  transpilePackages: ['react-email', 'prettier', 'react-email-bridge'],
  typescript: {
    // Vendor-fork has React 18/19 type drift via the monorepo hoist (root has
    // React 18 for the validation script, UI uses React 19). The Next build's
    // type pass is too strict for this — we run tsc manually for real type
    // checking. Runtime is fine because SWC transpiles by spec.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
