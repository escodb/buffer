'use strict'

const base64 = require('./codec/base64')

const CODECS = {
  base64
}

const DEFAULT_ENCODING = 'utf8'

class Buffer extends Uint8Array {
  static alloc (size) {
    return new Buffer(size)
  }

  static from (source, encoding = DEFAULT_ENCODING) {
    if (SOURCE_TYPES.some((T) => source instanceof T)) {
      return new Buffer(source)
    }
    if (typeof source === 'string') {
      return CODECS[encoding].decode(source, Buffer)
    }
  }

  toString (encoding = DEFAULT_ENCODING) {
    return CODECS[encoding].encode(this)
  }
}

const SOURCE_TYPES = [
  Array,
  ArrayBuffer,
  Buffer,
  Uint8Array
]

module.exports = { Buffer }
