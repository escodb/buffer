'use strict'

const ENCODING = 'utf-8'

const Utf8 = {
  encode (buf) {
    return new TextDecoder(ENCODING).decode(buf)
  },

  decode (str) {
    return new TextEncoder(ENCODING).encode(str)
  }
}

module.exports = Utf8
