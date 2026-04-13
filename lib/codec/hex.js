'use strict'

const transcode = require('./transcode')
const utf8 = require('./utf8')

const Hex = {
  encode (buf) {
    let str = transcode(buf, 8, 4, bitsToChar)
    return utf8.encode(str)
  },

  decode (str) {
    let buf = utf8.decode(str)
    return transcode(buf, 4, 8, charToBits)
  }
}

//      char      | code
//      ----------+-----------
//      0 - 9     | 30 - 39
//      A - F     | 41 - 46
//      a - f     | 61 - 66

function bitsToChar (b) {
  return ~((b - 0x0) | (0x9 - b)) >> 8 & (b + 0x30) // 0x30 - 0x00
       | ~((b - 0xa) | (0xf - b)) >> 8 & (b + 0x57) // 0x61 - 0x0a
}

function charToBits (c) {
  return ~((c - 0x30) | (0x39 - c)) >> 8 & (c - 0x30) // 0x00 - 0x30
       | ~((c - 0x41) | (0x46 - c)) >> 8 & (c - 0x37) // 0x0a - 0x41
       | ~((c - 0x61) | (0x66 - c)) >> 8 & (c - 0x57) // 0x0a - 0x61
}

module.exports = Hex
