# `@bonadocs/docgen`

__docgen is a program that extracts documentation for a Solidity project and generates an
interactive website from it using Docusaurus.__

`@bonadocs/docgen` is based on `solidity-docgen`. If you already use `solidity-docgen`, you
already know how to use `@bonadocs/docgen`. Hmmm, maybe 90% of it. The two main differences are:

- `@bonadocs/docgen` generates a website using Docusaurus, while `solidity-docgen` only generates
  Markdown files. You can turn off the website generation if you want to use a different static site
  generator and only markdown files will be generated, much like `solidity-docgen`. If you would like
  to use include widgets that make your documentation interactive, then this is a great option.
- `@bonadocs/docgen` generates widgets for deployed contracts, so developers can interact with the
  contracts directly from the documentation website. This is better than sending them off to Etherscan
  or worse, having them write their own scripts to interact with the contracts.

The markdown output is fully configurable through Handlebars templates, but the default templates should
do a good job of displaying all of the information in the source code in Markdown format. If you don't
want to generate a website, the generated Markdown files can be used with a static site generator 
such as Docusaurus, Vuepress, MkDocs, Jekyll (GitHub Pages), etc., in order to publish a documentation
website.

## Widget?

The widgets are interactive components that allow users to interact with the contracts directly from
the documentation website. Widgets run simulations by default and enable developers to test without
paying gas fees. Developers love to learn by doing, and this is the perfect way to let them do just that.
The widgets are generated using [`@bonadocs/widget`](https://github.com/bonadocs/widget).

__Note: widgets will only be generated for contracts with their deployment addresses specified.
Refer to the configuration below__

## Usage

Install `@bonadocs/docgen` from npm.

### Hardhat

Include the plugin in your Hardhat configuration.

```diff
 // hardhat.config.ts
+import '@bonadocs/docgen';

export default {
+  docgen: {
+    projectName: 'Your Protocol Name', // optional, a placeholder name will be used if omitted
+    projectDescription: 'An awesome web3 protocol.', // optional, a placeholder description will be used if omitted
+    deploymentAddresses: { // optional. If you want to generate widgets for deployed contracts
+      FirstContractName: [
+        {
+          chainId: 1, // mainnet
+          address: '0x...',
+        },
+        {
+          chainId: 42161, // arbitrum
+          address: '0x...',
+        },
+      ],
+      SecondContractName: [
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

Then run with `npx hardhat docgen`.

### As a library

```typescript
import { docgen } from '@bonadocs/docgen';

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
