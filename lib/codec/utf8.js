'use strict'

const ENCODING = 'utf-8'

const Utf8 = {
  encode (buf) {
    return new TextDecoder(ENCODING).decode(buf)
  },

  decode (str, Buffer) {
    let array = new TextEncoder(ENCODING).encode(str)
    return Buffer.from(array.buffer)
  }
}

module.exports = Utf8
