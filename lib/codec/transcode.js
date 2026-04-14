'use strict'

const PAD = 0x3d
const ID = (val) => val

function transcode (input, inBits, outBits, map = ID) {
  let decode = (inBits < outBits)
  let len = input.length

  while (decode && input[len - 1] === PAD) {
    len -= 1
  }

  let out = new Uint8Array(getLength(decode, inBits, outBits, len))
  let pos = 0
  let val = 0
  let rem = outBits

  for (let i = 0; i < len; i++) {
    let byte = input[i]
    let bits = decode ? map(byte) : byte
    let size = inBits

    while (size > 0) {
      let diff = size - rem

      if (diff < 0) {
        val |= bits << -diff
        rem -= size
        size = 0
      } else {
        val |= bits >> diff
        bits &= (1 << diff) - 1
        size -= rem
        rem = outBits
        out[pos++] = decode ? val : map(val)
        val = 0
      }
    }
  }

  if (rem !== outBits) {
    out[pos++] = decode ? val : map(val)
  }
  while (!decode && pos < out.length) {
    out[pos++] = PAD
  }

  return out
}

function getLength (decode, inBits, outBits, len) {
  if (decode) {
    return Math.floor(len * inBits / outBits)
  } else {
    let block = lcm(inBits, outBits)
    return Math.ceil(len * inBits / block) * block / outBits
  }
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

module.exports = transcode
