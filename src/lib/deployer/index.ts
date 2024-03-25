import type { TransactionRequest } from '@ethersproject/providers'
import cbor from 'cbor'
import type { BytesLike, Contract, ContractFactory } from 'ethers'
import { utils as ethersUtils } from 'ethers'

export async function deployTagged(
  factory: ContractFactory,
  args?: unknown[],
  options?: unknown,
): Promise<Contract> {
  args ??= []
  if (options !== undefined) {
    args.push(options)
  }

  const deployTx = factory.getDeployTransaction(...args)
  let tagged = false
  try {
    // tag bytecode and send
    deployTx.data = tagBytecode(deployTx.data!)
    tagged = true
    console.log('Tagged bytecode. Deploying...')
  } catch (e) {
    console.log('Error tagging bytecode, deploying without tag')
  }

  if (tagged) {
    return sendDeployTxAndGetContract(factory, deployTx)
  } else {
    return factory.deploy(...args)
  }
}

async function sendDeployTxAndGetContract(
  factory: ContractFactory,
  deployTx: TransactionRequest,
) {
  // Send the deployment transaction
  const tx = await factory.signer.sendTransaction(deployTx)

  const address = ethersUtils.getStatic<(tx: unknown) => string>(
    factory.constructor,
    'getContractAddress',
  )(tx)
  const contract = ethersUtils.getStatic<
    (address: string, contractInterface: unknown, signer?: unknown) => Contract
  >(factory.constructor, 'getContract')(
    address,
    factory.interface,
    factory.signer,
  )

  ethersUtils.defineReadOnly(contract, 'deployTransaction', tx)
  return contract
}

function tagBytecode(bytecode: BytesLike): BytesLike {
  const dataLength = ethersUtils.hexDataLength(bytecode)
  const encodedCborLength = ethersUtils.hexDataSlice(bytecode, dataLength - 2)
  const cborLength = parseInt(encodedCborLength, 16)
  const cborData = ethersUtils.hexDataSlice(
    bytecode,
    dataLength - 2 - cborLength,
    dataLength - 2,
  )
  const originalBytecode = ethersUtils.hexDataSlice(
    bytecode,
    0,
    dataLength - 2 - cborLength,
  )
  const decoded = cbor.decodeAllSync(cborData.slice(2))

  // fixed hex value - 0xB01AD0C5
  decoded[0].bonadocs = Buffer.from('B01AD0C5', 'hex')

  const encodedCbor = '0x' + cbor.encode(decoded[0]).toString('hex')
  const encodedLength = ethersUtils.hexZeroPad(
    '0x' + ethersUtils.hexDataLength(encodedCbor).toString(16),
    2,
  )
  return ethersUtils.hexConcat([originalBytecode, encodedCbor, encodedLength])
}
