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

    checkRange(targetStart, 'targetStart', 0)
    checkRange(sourceStart, 'sourceStart', 0, this.length)

    let end = Math.min(sourceEnd, sourceStart + target.length - targetStart)
    let source = this.subarray(sourceStart, end)

    target.set(source, targetStart)
  }
}

const SOURCE_TYPES = [
  Array,
  ArrayBuffer,
  Buffer,
  Uint8Array
]

let INT_TYPES = [
  'Int8', 'Int16', 'Int32', 'BigInt64',
  'UInt8', 'UInt16', 'UInt32', 'BigUInt64'
]

for (let endian of ['BE', 'LE']) {
  let isLE = (endian === 'LE')

  for (let type of INT_TYPES) {
    let fullType = type + (/8/.test(type) ? '' : endian)
    let size = parseInt(type.match(/\d+/)[0], 10) / 8

    let viewType = type.replace(/UI/, 'Ui')
    let get = 'get' + viewType
    let set = 'set' + viewType

    Buffer.prototype['read' + fullType] = function (offset = 0) {
      checkRange(offset, 'offset', 0, this.length - size)

      let view = new DataView(this.buffer)
      return view[get](offset, isLE)
    }

    Buffer.prototype['write' + fullType] = function (value, offset = 0) {
      checkRange(offset, 'offset', 0, this.length - size)

      let view = new DataView(this.buffer)
      view[set](offset, value, isLE)
      return offset + size
    }
  }
}

function checkRange (value, name, min, max = null) {
  if (value >= min && (max === null || value <= max)) return

  let message = `The value of "${name}" is out of range. It must be >= ${min}`
  if (max !== null) message += ` and <= ${max}`
  message += `. Received ${value}`

  let error = new RangeError(message)
  error.code = 'ERR_OUT_OF_RANGE'

  throw error
}

module.exports = Buffer
