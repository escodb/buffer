'use strict'

const PAD = 0x3d
const PAD_TAIL = /=*$/

const Base64 = {
  encode (buf) {
    let str = new Uint8Array(4 * Math.ceil(buf.length / 3))
    let len = buf.length

    for (let i = 0; i < len; i += 3) {
      let a = buf[i]
      let b = buf[i + 1] || 0
      let c = buf[i + 2] || 0

      //          6       12       18       24
      // +--------+--------+--------+--------+
      // | aaaaaa | aabbbb | bbbbcc | cccccc |
      // +--------+--------+--------+--------+

      let w =                   a >> 2
      let x = (a & 0x03) << 4 | b >> 4
      let y = (b & 0x0f) << 2 | c >> 6
      let z = (c & 0x3f)

      let ofs = 4 * i / 3

      str[ofs    ] = bitsToChar(w)
      str[ofs + 1] = bitsToChar(x)
      str[ofs + 2] = (i + 1 < len) ? bitsToChar(y) : PAD
      str[ofs + 3] = (i + 2 < len) ? bitsToChar(z) : PAD
    }

    return new TextDecoder().decode(str)
  },

  decode (str, Buffer) {
    let [pad] = str.match(PAD_TAIL)
    let len = str.length

    let buf = Buffer.alloc(len * 3 / 4 - pad.length)
    let ofs = 0

    for (let i = 0; i < len; i += 4) {
      let a = charToBits(str.charCodeAt(i))
      let b = charToBits(str.charCodeAt(i + 1))
      let c = charToBits(str.charCodeAt(i + 2))
      let d = charToBits(str.charCodeAt(i + 3))

      //            8         16         24
      // +----------+----------+----------+
      // | aaaaaabb | bbbbcccc | ccdddddd |
      // +----------+----------+----------+

      buf[ofs++] =  a        << 2 | b >> 4
      buf[ofs++] = (b & 0xf) << 4 | c >> 2
      buf[ofs++] = (c & 0x3) << 6 | d
    }

    return buf
  }
}

//      input       | char      | code
//      ------------+-----------+-----------
//      00 - 19     | A - Z     | 41 - 5a
//      1a - 33     | a - z     | 61 - 7a
//      34 - 3d     | 0 - 9     | 30 - 39
//      3e          | +         | 2b
//      3f          | /         | 2f
//      --          | =         | 3d

function bitsToChar (b) {
  return ~((b - 0x00) | (0x19 - b)) >> 8 & (b + 0x41) // 0x41 - 0x00
       | ~((b - 0x1a) | (0x33 - b)) >> 8 & (b + 0x47) // 0x61 - 0x1a
       | ~((b - 0x34) | (0x3d - b)) >> 8 & (b - 0x04) // 0x30 - 0x34
       | ~((b - 0x3e) | (0x3e - b)) >> 8 &      0x2b
       | ~((b - 0x3f) | (0x3f - b)) >> 8 &      0x2f
}

function charToBits (c) {
  c = isNaN(c) ? 0 : (c === PAD) ? 0 : c

  return ~((c - 0x41) | (0x5a - c)) >> 8 & (c - 0x41) // 0x00 - 0x41
       | ~((c - 0x61) | (0x7a - c)) >> 8 & (c - 0x47) // 0x1a - 0x61
       | ~((c - 0x30) | (0x39 - c)) >> 8 & (c + 0x04) // 0x34 - 0x30
       | ~((c - 0x2b) | (0x2b - c)) >> 8 &      0x3e
       | ~((c - 0x2f) | (0x2f - c)) >> 8 &      0x3f
}

module.exports = Base64
