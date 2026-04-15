'use strict'

const { transcode } = require('./transcode')
const utf8 = require('./utf8')

const Base64 = {
  encode (buf) {
    let str = transcode(8, 6, buf, bitsToChar)
    return utf8.encode(str)
  },

  decode (str) {
    let buf = utf8.decode(str)
    return transcode(6, 8, buf, charToBits)
  }
}

//      input       | char      | code
//      ------------+-----------+-----------
//      00 - 19     | A - Z     | 41 - 5a
//      1a - 33     | a - z     | 61 - 7a
//      34 - 3d     | 0 - 9     | 30 - 39
//      3e          | +         | 2b
//      3f          | /         | 2f

function bitsToChar (b) {
  return ~((b - 0x00) | (0x19 - b)) >> 8 & (b + 0x41) // 0x41 - 0x00
       | ~((b - 0x1a) | (0x33 - b)) >> 8 & (b + 0x47) // 0x61 - 0x1a
       | ~((b - 0x34) | (0x3d - b)) >> 8 & (b - 0x04) // 0x30 - 0x34
       | ~((b - 0x3e) | (0x3e - b)) >> 8 &      0x2b
       | ~((b - 0x3f) | (0x3f - b)) >> 8 &      0x2f
}

function charToBits (c) {
  return ~((c - 0x41) | (0x5a - c)) >> 8 & (c - 0x41) // 0x00 - 0x41
       | ~((c - 0x61) | (0x7a - c)) >> 8 & (c - 0x47) // 0x1a - 0x61
       | ~((c - 0x30) | (0x39 - c)) >> 8 & (c + 0x04) // 0x34 - 0x30
       | ~((c - 0x2b) | (0x2b - c)) >> 8 &      0x3e
       | ~((c - 0x2f) | (0x2f - c)) >> 8 &      0x3f
}

module.exports = Base64
