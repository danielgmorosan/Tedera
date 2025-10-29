import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: '/Users/souheila/testhedera/hedera-hackathon/apps/web',
  webpack: (config, { isServer, webpack }) => {
    // Handle Node.js built-in modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
    };
    
    // Handle node: scheme imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:buffer': require.resolve('buffer'),
      'node:util': require.resolve('util'),
      'node:crypto': require.resolve('crypto-browserify'),
      'node:stream': require.resolve('stream-browserify'),
      'node:path': require.resolve('path-browserify'),
      'node:fs': false,
      'node:os': false,
      'node:net': false,
      'node:tls': false,
      'node:http': false,
      'node:https': false,
      'node:url': require.resolve('url'),
      'node:zlib': require.resolve('browserify-zlib'),
    };
    
    // Add a plugin to handle node: scheme imports
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          const module = resource.request.replace(/^node:/, '');
          if (module === 'buffer') {
            resource.request = require.resolve('buffer');
          } else if (module === 'util') {
            resource.request = require.resolve('util');
          } else if (module === 'crypto') {
            resource.request = require.resolve('crypto-browserify');
          } else if (module === 'stream') {
            resource.request = require.resolve('stream-browserify');
          } else if (module === 'path') {
            resource.request = require.resolve('path-browserify');
          } else if (module === 'url') {
            resource.request = require.resolve('url');
          } else if (module === 'zlib') {
            resource.request = require.resolve('browserify-zlib');
          } else {
            resource.request = false;
          }
        }
      )
    );
    
    // Provide global polyfills
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );
    
    // Exclude contracts package from webpack processing to avoid import.meta issues
    config.externals = [
      ...(config.externals || []),
      'rdf-canonize-native',
      '@mattrglobal/node-bbs-signatures',
      '@mattrglobal/bbs-signatures',
      /^@hashgraph\/asset-tokenization-contracts/,
    ];

    // Ignore problematic modules during server-side rendering
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'rdf-canonize-native',
        '@mattrglobal/node-bbs-signatures',
        '@mattrglobal/bbs-signatures',
      ];
    }

    // Ignore specific modules that cause issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@mattrglobal\/(node-)?bbs-signatures/,
      })
    );
    
    return config;
  },
  serverExternalPackages: [
    '@hashgraph/asset-tokenization-sdk',
    '@hashgraph/sdk',
    '@hashgraph/hedera-custodians-integration',
    '@hashgraph/hedera-wallet-connect',
    '@hashgraph/asset-tokenization-contracts',
  ],
}

export default nextConfig
