# @escodb/buffer

A browser-compatible implementation of a subset of the [Node.js
Buffer](https://nodejs.org/api/buffer.html) API. This package implements only
the methods needed by [EscoDB](https://github.com/escodb/core) and is thus a lot
smaller than other `Buffer` implementations. We use `Buffer` as it provides a
few more conveniences compared to the
[Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
interface, but since `Buffer` extends `Uint8Array` you can use all the typed
array methods on a `Buffer` instance.


## Installation

    npm install @escodb/buffer


## Usage

Import the `Buffer` class as follows:

```js
const { Buffer } = require('@escodb/buffer')
```

This will return the native `Buffer` class on Node.js, and our own
implementation in browser environments.

The `Buffer` methods listed below are implemented, and should work identically
to their Node.js versions with the following known caveats:

- The supported encodings are `base64`, `hex` and `utf8`, and no others.
- The `readIntBE()`, `readIntLE()`, `readUIntBE()`, `readUIntLE()`,
  `writeIntBE()`, `writeIntLE()`, `writeUIntBE()` and `writeUIntLE()` methods
  accept a maximum `byteLength` value of 4.

Supported methods:

- `Buffer.alloc(size)`
- `Buffer.compare(buf1, buf2)`
- `Buffer.concat(list[, totalLength])`
- `Buffer.from(object[, encoding])`
- `Buffer.isBuffer(object)`
- `Buffer.isEncoding(encoding)`
- `buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])`
- `buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])`
- `buf.equals(target)`
- `buf.readBigInt64BE([offset])`
- `buf.readBigInt64LE([offset])`
- `buf.readBigUInt64BE([offset])`
- `buf.readBigUInt64LE([offset])`
- `buf.readInt16BE([offset])`
- `buf.readInt16LE([offset])`
- `buf.readInt32BE([offset])`
- `buf.readInt32LE([offset])`
- `buf.readInt8([offset])`
- `buf.readIntBE(offset, byteLength)`
- `buf.readIntLE(offset, byteLength)`
- `buf.readUInt16BE([offset])`
- `buf.readUInt16LE([offset])`
- `buf.readUInt32BE([offset])`
- `buf.readUInt32LE([offset])`
- `buf.readUInt8([offset])`
- `buf.readUIntBE(offset, byteLength)`
- `buf.readUIntLE(offset, byteLength)`
- `buf.toString([encoding])`
- `buf.writeBigInt64BE(value[, offset])`
- `buf.writeBigInt64LE(value[, offset])`
- `buf.writeBigUInt64BE(value[, offset])`
- `buf.writeBigUInt64LE(value[, offset])`
- `buf.writeInt16BE(value[, offset])`
- `buf.writeInt16LE(value[, offset])`
- `buf.writeInt32BE(value[, offset])`
- `buf.writeInt32LE(value[, offset])`
- `buf.writeInt8(value[, offset])`
- `buf.writeIntBE(value, offset, byteLength)`
- `buf.writeIntLE(value, offset, byteLength)`
- `buf.writeUInt16BE(value[, offset])`
- `buf.writeUInt16LE(value[, offset])`
- `buf.writeUInt32BE(value[, offset])`
- `buf.writeUInt32LE(value[, offset])`
- `buf.writeUInt8(value[, offset])`
- `buf.writeUIntBE(value, offset, byteLength)`
- `buf.writeUIntLE(value, offset, byteLength)`
