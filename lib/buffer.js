'use strict'

const base64 = require('./codec/base64')
const hex = require('./codec/hex')
const utf8 = require('./codec/utf8')

const CODECS = {
  base64,
  hex,
  utf8
}

const DEFAULT_ENCODING = 'utf8'

class Buffer extends Uint8Array {
  static alloc (size) {
    return new Buffer(size)
  }

  static concat (list, length = null) {
    length = length || list.reduce((l, buf) => l + buf.length, 0)

    let target = Buffer.alloc(length)
    let offset = 0

    for (let source of list) {
      source.copy(target, offset)
      offset += source.length
    }

    return target
  }

  static from (source, encoding = DEFAULT_ENCODING) {
    if (SOURCE_TYPES.some((T) => source instanceof T)) {
      return new Buffer(source)
    }
    if (typeof source === 'string') {
      return CODECS[encoding.toLowerCase()].decode(source, Buffer)
    }
  }

  toString (encoding = DEFAULT_ENCODING) {
    return CODECS[encoding.toLowerCase()].encode(this)
  }

  copy (target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
    if (targetStart > target.length) return

    if (targetStart < 0) {
      throw rangeError(`The value of "targetStart" is out of range. It must be >= 0. Received ${targetStart}`)
    }
    if (sourceStart < 0 || sourceStart > this.length) {
      throw rangeError(`The value of "sourceStart" is out of range. It must be >= 0 && <= ${this.length}. Received ${sourceStart}`)
    }

    let end = Math.min(sourceEnd, sourceStart + target.length - targetStart)
    let source = this.subarray(sourceStart, end)

    target.set(source, targetStart)
  }
}

function rangeError (message) {
  let error = new RangeError(message)
  error.code = 'ERR_OUT_OF_RANGE'
  return error
}

const SOURCE_TYPES = [
  Array,
  ArrayBuffer,
  Buffer,
  Uint8Array
]

module.exports = Buffer
