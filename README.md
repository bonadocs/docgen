# `bonadocs-docgen`

*bonadocs-docgen is a program that extracts documentation for a Solidity project and generates an
interactive website from it using Docusaurus.*

`bonadocs-docgen` is based on `solidity-docgen`.

The tool will generate a static site using Docusaurus by default. This can be turned off by setting the
`website.generate` option to `false` in the configuration.

The output is fully configurable through Handlebars templates, but the default templates should do
a good job of displaying all of the information in the source code in Markdown format. If you don't
want to generate a website, the generated Markdown files can be used with a static site generator 
such as Docusaurus, Vuepress, MkDocs, Jekyll (GitHub Pages), etc., in order to publish a documentation
website.

## Usage

Install `bonadocs-docgen` from npm.

### Hardhat

Include the plugin in your Hardhat configuration.

```diff
 // hardhat.config.ts
+import 'bonadocs-docgen';

export default {
+  docgen: {
+    projectName: 'Your Protocol Name', // optional, a placeholder name will be used if omitted
+    projectDescription: 'An awesome web3 protocol.', // optional, a placeholder description will be used if omitted
+    deploymentAddresses: { // optional. If you want to generate widgets for deployed contracts
+      MyFirstContract: [
+        {
+          chainId: 1, // mainnet
+          address: '0x...',
+        },
+        {
+          chainId: 42161, // arbitrum
+          address: '0x...',
+        },
+      ],
+      MySecondContract: [
+        {
+          chainId: 1, // mainnet
+          address: '0x...',
+        },
+        {
+          chainId: 42161, // arbitrum
+          address: '0x...',
+        },
+      ],
+    },
+  }, // if necessary to customize config
};
```

Then run with `hardhat docgen`.

### As a library

```typescript
import { docgen } from 'bonadocs-docgen';

abis = [
  {
    contractName: 'MyContract',
    abi: '...'
  }
]
await docgen([{ output: solcOutput }], config, abis);
```

`solcOutput` must be the standard JSON output of the compiler, with at least the `ast` output. There can be more than one.

`config` is an optional object with the values as specified below.

## Config

See [`config.ts`](./src/lib/config.ts) for the list of options and their documentation.

`abis` is an optional array of objects with the following properties:

- `contractName`: the name of the contract
- `abi`: the ABI of the contract
