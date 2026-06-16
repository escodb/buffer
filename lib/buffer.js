'use strict'

const {
  base64,
  hex,
  utf8,
  transcodeBE,
  transcodeLE
} = require('@escodb/buffer-codec')

const CODECS = {
  base64,
  hex,
  utf8
}

const DEFAULT_ENCODING = 'utf8'

class Buffer extends Uint8Array {
  static alloc (size) {
    if (typeof size === 'number') return new Buffer(size)

    let error = new TypeError(`The "size" argument must be of type number. Received type ${typeof size}`)
    error.code = 'ERR_INVALID_ARG_TYPE'
    throw error
  }

  static compare (buf1, buf2) {
    return buf1.compare(buf2)
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
      let array = CODECS[encoding.toLowerCase()].decode(source)
      return new Buffer(array.buffer)
    }

    let error = new TypeError(`The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type ${typeof source}`)
    error.code = 'ERR_INVALID_ARG_TYPE'
    throw error
  }

  static isBuffer (object) {
    return object instanceof Buffer
  }

  static isEncoding (encoding) {
    return CODECS.hasOwnProperty(encoding.toLowerCase())
  }

  compare (target, targetStart = 0, targetEnd = target.length, sourceStart = 0, sourceEnd = this.length) {
    let len = Math.max(sourceEnd - sourceStart, targetEnd - targetStart)

    for (let i = 0; i < len; i++) {
      let sourceOffset = sourceStart + i
      if (sourceOffset >= this.length) return -1

      let targetOffset = targetStart + i
      if (targetOffset >= target.length) return 1

      let a = this[sourceOffset]
      let b = target[targetOffset]

      if (a < b) return -1
      if (a > b) return 1
    }

    return 0
  }

  copy (target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
    checkRange(targetStart, 'targetStart', 0)
    checkRange(sourceStart, 'sourceStart', 0, this.length)

    let end = Math.min(this.length, sourceEnd)
    let len = Math.min(end - sourceStart, target.length - targetStart)
    if (len < 0) return 0

    let source = this.subarray(sourceStart, sourceStart + len)
    target.set(source, targetStart)

    return len
  }

  equals (target) {
    return this.compare(target) === 0
  }

  toString (encoding = DEFAULT_ENCODING) {
    return CODECS[encoding.toLowerCase()].encode(this)
  }
}

const SOURCE_TYPES = [
  Array,
  ArrayBuffer,
  Buffer,
  Uint8Array
]

const INT_TYPES = ['Int', 'UInt']
const INT_SIZES = [8, 16, 32, 64]

const target = [0]
const views = new WeakMap()

function getView (buffer) {
  if (!views.has(buffer)) {
    views.set(buffer, new DataView(buffer))
  }
  return views.get(buffer)
}

for (let endian of ['BE', 'LE']) {
  let isLE = (endian === 'LE')
  let transcode = isLE ? transcodeLE : transcodeBE

  for (let type of INT_TYPES) {
    let isSigned = (type === 'Int')
    let unsizedRead = 'read' + type + endian
    let unsizedWrite = 'write' + type + endian

    Buffer.prototype[unsizedRead] = function (offset, byteLength) {
      checkRange(offset, 'offset', 0, this.length - byteLength)
      checkRange(byteLength, 'byteLength', 1, 4)

      transcode(8, 8 * byteLength, this, target, 0, offset, offset + byteLength)
      let value = target[0]
      let limit = Math.pow(2, byteLength * 8 - (isSigned ? 1 : 0))

      if (isSigned && value >= limit) value -= 2 * limit
      if (!isSigned && value < 0) value += limit

      return value
    }

    Buffer.prototype[unsizedWrite] = function (value, offset, byteLength) {
      checkRange(offset, 'offset', 0, this.length - byteLength)
      checkRange(byteLength, 'byteLength', 1, 4)

      target[0] = value
      transcode(8 * byteLength, 8, target, this, offset, 0, byteLength)

      return offset + byteLength
    }

    for (let bitSize of INT_SIZES) {
      let baseType = (bitSize === 64) ? 'Big' + type : type
      let fullType = baseType + bitSize + (bitSize === 8 ? '' : endian)

      let viewType = baseType.replace(/UI/, 'Ui') + bitSize
      let get = 'get' + viewType
      let set = 'set' + viewType

      let byteSize = bitSize / 8

      if (bitSize === 64) {
        Buffer.prototype['read' + fullType] = function (offset = 0) {
          checkRange(offset, 'offset', 0, this.length - byteSize)

          let view = getView(this.buffer)
          return view[get](offset, isLE)
        }

        Buffer.prototype['write' + fullType] = function (value, offset = 0) {
          checkRange(offset, 'offset', 0, this.length - byteSize)

          let view = getView(this.buffer)
          view[set](offset, value, isLE)
          return offset + byteSize
        }
      } else {
        Buffer.prototype['read' + fullType] = function (offset = 0) {
          return this[unsizedRead](offset, byteSize)
        }

        Buffer.prototype['write' + fullType] = function (value, offset = 0) {
          return this[unsizedWrite](value, offset, byteSize)
        }
      }

      let alias = fullType.replace(/UI/, 'Ui')
      Buffer.prototype['read' + alias] = Buffer.prototype['read' + fullType]
      Buffer.prototype['write' + alias] = Buffer.prototype['write' + fullType]
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

module.exports = { Buffer }
