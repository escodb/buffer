'use strict'

//      char      | code
//      ----------+-----------
//      0 - 9     | 30 - 39
//      A - F     | 41 - 46
//      a - f     | 61 - 66

const Hex = {
  encode (buf) {
    let str = []

    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i]
      str.push(bitsToChar(byte >> 4), bitsToChar(byte & 0xf))
    }

    return String.fromCharCode(...str)
  },

  decode (str, Buffer) {
    let buf = Buffer.alloc(str.length / 2)

    for (let i = 0; i < str.length; i += 2) {
      let a = charToBits(str.charCodeAt(i))
      let b = charToBits(str.charCodeAt(i + 1))

      buf[i / 2] = a << 4 | b
    }

    return buf
  }
}

function bitsToChar (b) {
  return ~((b - 0x0) | (0x9 - b)) >> 8 & (b + 0x30) // 0x30 - 0x00
       | ~((b - 0xa) | (0xf - b)) >> 8 & (b + 0x57) // 0x61 - 0x0a
}

function charToBits (c) {
  c = isNaN(c) ? 0 : c

  return ~((c - 0x30) | (0x39 - c)) >> 8 & (c - 0x30) // 0x00 - 0x30
       | ~((c - 0x41) | (0x46 - c)) >> 8 & (c - 0x37) // 0x0a - 0x41
       | ~((c - 0x61) | (0x66 - c)) >> 8 & (c - 0x57) // 0x0a - 0x61
}

module.exports = Hex
