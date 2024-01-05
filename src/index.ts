export { main as docgen } from './lib'
export { docItemTypes } from 'solidity-docgen/dist/doc-item'
export { DocItemWithContext } from 'solidity-docgen/dist/site'

import './hardhat/type-extensions'

if ('extendConfig' in global && 'task' in global) {
  // Assume Hardhat.
  require('./hardhat')
}

// We ask Node.js not to cache this file.
delete require.cache[__filename]
