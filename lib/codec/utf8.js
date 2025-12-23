'use strict'

//    byte layout                             | bits  | max value
//    ----------------------------------------+-------+----------
//                                  0aaaaaaa  | 7     | U+007F
//                        110aaaaa  10bbbbbb  | 11    | U+07FF
//              1110aaaa  10bbbbbb  10cccccc  | 16    | U+FFFF
//    11110aaa  10bbbbbb  10cccccc  10dddddd  | 21    | U+10FFFF

const REPLACEMENT_CHAR = 0xfffd

const Utf8 = {
  encode (buf) {
    let len = buf.length
    let cps = []
    let ofs = 0

    while (ofs < len) {
      let b = buf[ofs++]

      if (b < 0x80) {
        cps.push(b)
      } else if (b < 0xc2) {
        cps.push(REPLACEMENT_CHAR)
      } else if (b < 0xe0 && ofs < len) {
        cps.push(((b & 0x1f) << 6) | (buf[ofs++] & 0x3f))
      } else if (b < 0xf0 && ofs < len - 1) {
        cps.push(((b & 0x0f) << 12) | (buf[ofs++] & 0x3f) << 6 | (buf[ofs++] & 0x3f))
      } else if (b < 0xf5 && ofs < len - 2) {
        cps.push(((b & 0x07) << 18) | (buf[ofs++] & 0x3f) << 12 | (buf[ofs++] & 0x3f) << 6 | (buf[ofs++] & 0x3f))
      } else {
        cps.push(REPLACEMENT_CHAR)
      }
    }

    return String.fromCodePoint(...cps)
  },

  decode (str, Buffer) {
    let bytes = []
    let ofs = 0

    while (ofs < str.length) {
      let cp = str.codePointAt(ofs++)

      if (cp <= 0x7f) {
        bytes.push(cp)
      } else if (cp <= 0x7ff) {
        bytes.push(0xc0 | cp >> 6, 0x80 | cp & 0x3f)
      } else if (cp <= 0xffff) {
        bytes.push(0xe0 | cp >> 12, 0x80 | (cp >> 6) & 0x3f, 0x80 | cp & 0x3f)
      } else if (cp <= 0x10ffff) {
        bytes.push(0xf0 | cp >> 18, 0x80 | (cp >> 12) & 0x3f, 0x80 | (cp >> 6) & 0x3f, 0x80 | cp & 0x3f)
        ofs += 1
      }
    }

    return Buffer.from(bytes)
  }
}

module.exports = Utf8
