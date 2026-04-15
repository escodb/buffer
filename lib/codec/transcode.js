'use strict'

const PAD = 0x3d
const ID = (val) => val

function transcode (inBits, outBits, source, map = ID, pad = PAD) {
  let decode = (inBits < outBits)
  let len = source.length

  while (decode && source[len - 1] === pad) {
    len -= 1
  }

  let target = new Uint8Array(getLength(inBits, outBits, len))
  let pos = transcodeBEwithMap(inBits, outBits, map, source, target, 0, 0, len)

  while (!decode && pos < target.length) {
    target[pos++] = pad
  }

  return target
}

function getLength (inBits, outBits, len) {
  if (inBits < outBits) {
    return Math.floor(len * inBits / outBits)
  } else {
    let block = lcm(inBits, outBits)
    return Math.ceil(len * inBits / block) * block / outBits
  }
}

function transcodeBE (inBits, outBits, ...rest) {
  return transcodeBEwithMap(inBits, outBits, ID, ...rest)
}

function transcodeBEwithMap (inBits, outBits, map, source, target, targetStart = 0, sourceStart = 0, sourceEnd = source.length) {
  let pos = targetStart
  let val = 0
  let rem = outBits

  let decode = (inBits < outBits)

  for (let i = sourceStart; i < sourceEnd; i++) {
    let byte = source[i]
    let bits = decode ? map(byte) : byte
    let size = inBits

    while (size > 0) {
      let diff = size - rem

      val |= (diff < 0) ? bits << -diff : bits >> diff
      bits &= (1 << diff) - 1

      let tmp = rem
      rem -= size
      size -= tmp

      if (rem <= 0) {
        target[pos++] = decode ? val : map(val)
        val = 0
        rem = outBits
      }
    }
  }

  if (rem !== outBits) {
    target[pos++] = decode ? val : map(val)
  }

  return pos
}

function transcodeLE (inBits, outBits, source, target, targetStart = 0, sourceStart = 0, sourceEnd = source.length) {
  let pos = targetStart
  let val = 0
  let rem = outBits

  for (let i = sourceStart; i < sourceEnd; i++) {
    let bits = source[i]
    let size = inBits

    while (size > 0) {
      val |= bits << (outBits - rem)
      bits >>= rem

      let tmp = rem
      rem -= size
      size -= tmp

      if (rem <= 0) {
        target[pos++] = val
        val = 0
        rem = outBits
      }
    }
  }

  return pos
}

function lcm (x, y) {
  return x * y / gcd(x, y)
}

function gcd (x, y) {
  while (y !== 0) {
    [x, y] = [y, x % y]
  }
  return x
}

module.exports = {
  transcode,
  transcodeBE,
  transcodeLE
}
