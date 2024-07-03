import { TransactionRequest } from '@ethersproject/providers'
import cbor from 'cbor'
import { type BytesLike, ContractFactory } from 'ethers'
import { utils as ethersUtils } from 'ethers/lib/ethers'

export class BonadocsTaggedFactory extends ContractFactory {
  constructor(wrappedFactory: ContractFactory) {
    super(
      wrappedFactory.interface,
      wrappedFactory.bytecode,
      wrappedFactory.signer,
    )
  }

  getDeployTransaction(...args: Array<unknown>): TransactionRequest {
    const deployTx = super.getDeployTransaction(...args)
    const constructorArgs = ethersUtils
      .hexlify(deployTx.data!)
      .slice(this.bytecode.length)
    try {
      // tag bytecode and send
      deployTx.data = tagBytecode(this.bytecode) + constructorArgs
    } catch (e) {
      console.log(
        'Failed to add bonadocs tag to contract metadata, deploying without tag',
      )
    }

    return deployTx
  }
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
  return editContractLength(
    ethersUtils.hexConcat([originalBytecode, encodedCbor, encodedLength]),
    cborLength,
    parseInt(encodedLength, 16),
  )
}

function editContractLength(
  byteCodeWithNewCBORHex: string,
  oldCBORLength: number,
  newCBORLength: number,
): string {
  // Look for a special pattern of contract deployment tx present at the end of the constructor bytecode
  const byteCodeWithNewCBOR = Array.from(
    byteCodeWithNewCBORHex.slice(2).match(/.{2}/g)!,
  )
  const originalByteCodeLength =
    byteCodeWithNewCBOR.length - newCBORLength + oldCBORLength
  const finalByteCodeLength = byteCodeWithNewCBOR.length

  const [patternsToDetect, editFunctions] = getCodeSizeCodeCopyPatterns(
    originalByteCodeLength,
  )

  const firstMatchingPattern = detectPatterns(
    byteCodeWithNewCBOR,
    patternsToDetect,
  )
  if (!firstMatchingPattern) {
    throw new Error('Could not find a pattern to edit')
  }

  const [patternIndex, pattern] = firstMatchingPattern
  const editFunction = editFunctions[pattern]
  editFunction(byteCodeWithNewCBOR, patternIndex, finalByteCodeLength)
  return '0x' + byteCodeWithNewCBOR.join('')
}

function detectPatterns(
  hexCode: string[],
  patterns: string[][],
  start = 0,
  end = hexCode.length,
) {
  for (let i = start; i < end; i++) {
    for (let j = 0; j < patterns.length; j++) {
      const pattern = patterns[j]
      if (hexCode[i] === pattern[0]) {
        let found = true
        for (let k = 1; k < pattern.length; k++) {
          if (hexCode[i + k] !== pattern[k]) {
            found = false
            break
          }
        }
        if (found) {
          return [i, j] as const // index of the pattern and the pattern itself
        }
      }
    }
  }

  return null
}

function getCodeSizeCodeCopyPatterns(byteCodeLength: number) {
  const pushCodeSizeOps = []
  const byteCodeLengthHex = byteCodeLength.toString(16).padStart(2, '0')
  if (byteCodeLengthHex.length === 2) {
    pushCodeSizeOps.push(['60', byteCodeLengthHex]) // PUSH1 <byteCodeLengthHex>
  }

  if (byteCodeLengthHex.length <= 4) {
    const hex = byteCodeLengthHex.padStart(4, '0')
    pushCodeSizeOps.push(['61', hex.slice(0, 2), hex.slice(2)]) // PUSH2 <byteCodeLengthHex>
  }

  if (byteCodeLengthHex.length <= 6) {
    const hex = byteCodeLengthHex.padStart(6, '0')
    pushCodeSizeOps.push(['62', ...hex.match(/.{2}/g)!]) // PUSH3 <byteCodeLengthHex>
  }

  /**
   * Example:
   *  62  PUSH3 <size>
   *  38  CODESIZE
   *  03  SUB
   *  80  DUP1
   *  62  PUSH3 <size>
   *  83  DUP4
   *  39  CODECOPY
   */
  const patterns = pushCodeSizeOps.map((ops) => [
    ...ops,
    '38',
    '03',
    '80',
    ...ops,
    '83',
    '39',
  ])

  const editFunctions = pushCodeSizeOps.map(
    (ops, i) => (array: string[], patternStart: number, newSize: number) => {
      // push3, push2, or push1
      const hex = newSize
        .toString(16)
        .padStart((4 - pushCodeSizeOps.length + i) * 2, '0')
      const newOps = [ops[0], ...hex.match(/.{2}/g)!]
      const newPattern = [...newOps, '38', '03', '80', ...newOps, '83', '39']

      array.splice(patternStart, newPattern.length, ...newPattern)
    },
  )

  return [patterns, editFunctions] as const
}
