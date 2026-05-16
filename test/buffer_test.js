'use strict'

const { assert } = require('chai')

function assertBuffer (buf, bytes) {
  assert.equal(buf.length, bytes.length)
  assert(bytes.every((b, i) => b === buf[i]))
}

function spec (name, Buffer) {
  describe(`Buffer: ${name}`, () => {
    describe('alloc()', () => {
      it('returns a buffer of the given size', () => {
        let buf = Buffer.alloc(12)
        assert.equal(buf.length, 12)
      })

      it('throws an error with a non-size argument', () => {
        assert.throws(() => Buffer.alloc('12'))
      })
    })

    describe('from()', () => {
      it('returns a buffer decoded from the content', () => {
        let buf = Buffer.from('abcd', 'hex')
        assertBuffer(buf, [0xab, 0xcd])
      })

      it('throws an error with a non-content argument', () => {
        assert.throws(() => Buffer.from(12))
      })
    })

    describe('copy()', () => {
      let source = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9a])

      it('copies the source to the start of the target', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target), 5)
        assertBuffer(target, [0x12, 0x34, 0x56, 0x78, 0x9a, 0, 0, 0])
      })

      it('copies the source to a non-zero offset', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 2), 5)
        assertBuffer(target, [0, 0, 0x12, 0x34, 0x56, 0x78, 0x9a, 0])
      })

      it('copies the source near the end of the target', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 5), 3)
        assertBuffer(target, [0, 0, 0, 0, 0, 0x12, 0x34, 0x56])
      })

      it('copies a source to a smaller target', () => {
        let target = Buffer.alloc(3)
        assert.equal(source.copy(target), 3)
        assertBuffer(target, [0x12, 0x34, 0x56])
      })

      it('copies a source to a smaller target with an offset', () => {
        let target = Buffer.alloc(3)
        assert.equal(source.copy(target, 2), 1)
        assertBuffer(target, [0, 0, 0x12])
      })

      it('copies a slice of the source', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 0, 0, 3), 3)
        assert.equal(source.copy(target, 5, 2, 4), 2)
        assertBuffer(target, [0x12, 0x34, 0x56, 0, 0, 0x56, 0x78, 0])
      })

      it('fails to copy before the start of the target', () => {
        let target = Buffer.alloc(8)
        assert.throws(() => source.copy(target, -1))
      })

      it('copies past the end of the target', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 10), 0)
        assertBuffer(target, [0, 0, 0, 0, 0, 0, 0, 0])
      })

      it('fails to copy starting past the end of the source', () => {
        let target = Buffer.alloc(8)
        assert.throws(() => source.copy(target, 0, 6))
      })

      it('copies ending past the end of the source', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 1, 2, 6), 3)
        assertBuffer(target, [0, 0x56, 0x78, 0x9a, 0, 0, 0, 0])
      })

      it('copies when the source offsets are not ordered', () => {
        let target = Buffer.alloc(8)
        assert.equal(source.copy(target, 1, 4, 2), 0)
        assertBuffer(target, [0, 0, 0, 0, 0, 0, 0, 0])
      })
    })

    describe('concat()', () => {
      let inputs = [
        Buffer.from([0x12, 0x34]),
        Buffer.alloc(0),
        Buffer.from([0x56, 0x78, 0x9a]),
        Buffer.from([0xbc])
      ]

      it('concatenates several buffers', () => {
        let out = Buffer.concat(inputs)
        assertBuffer(out, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
      })

      it('sets a different output length', () => {
        let out = Buffer.concat(inputs, 8)
        assertBuffer(out, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0, 0])
      })

      it('sets a short output length', () => {
        let out = Buffer.concat(inputs, 3)
        assertBuffer(out, [0x12, 0x34, 0x56])
      })
    })

    describe('writeInt()', () => {
      it('writes an IntXBE', () => {
        let buf = Buffer.alloc(12)

        assert.equal(buf.writeInt8(0x56), 1)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt8(-0x56), 1)
        assertBuffer(buf, [0xaa, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt16BE(0x1234), 2)
        assertBuffer(buf, [0x12, 0x34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt16BE(-0x1234), 2)
        assertBuffer(buf, [0xed, 0xcc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt32BE(0x12345678), 4)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt32BE(-0x12345678), 4)
        assertBuffer(buf, [0xed, 0xcb, 0xa9, 0x88, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeBigInt64BE(0x123456789abcdef0n), 8)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0, 0, 0, 0])

        assert.equal(buf.writeBigInt64BE(-0x123456789abcdef0n), 8)
        assertBuffer(buf, [0xed, 0xcb, 0xa9, 0x87, 0x65, 0x43, 0x21, 0x10, 0, 0, 0, 0])
      })

      it('writes a UIntXBE', () => {
        let buf = Buffer.alloc(12)

        assert.equal(buf.writeUInt8(0x56), 1)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeUint16BE(0x1234), 2)
        assertBuffer(buf, [0x12, 0x34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeUInt32BE(0x12345678), 4)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeBigUInt64BE(0x123456789abcdef0n), 8)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0, 0, 0, 0])
      })

      it('writes an IntXLE', () => {
        let buf = Buffer.alloc(12)

        assert.equal(buf.writeInt8(0x56), 1)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt8(-0x56), 1)
        assertBuffer(buf, [0xaa, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt16LE(0x1234), 2)
        assertBuffer(buf, [0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt16LE(-0x1234), 2)
        assertBuffer(buf, [0xcc, 0xed, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt32LE(0x12345678), 4)
        assertBuffer(buf, [0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeInt32LE(-0x12345678), 4)
        assertBuffer(buf, [0x88, 0xa9, 0xcb, 0xed, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeBigInt64LE(0x123456789abcdef0n), 8)
        assertBuffer(buf, [0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0])

        assert.equal(buf.writeBigInt64LE(-0x123456789abcdef0n), 8)
        assertBuffer(buf, [0x10, 0x21, 0x43, 0x65, 0x87, 0xa9, 0xcb, 0xed, 0, 0, 0, 0])
      })

      it('writes a UIntXLE', () => {
        let buf = Buffer.alloc(12)

        assert.equal(buf.writeUInt8(0x56), 1)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeUInt16LE(0x1234), 2)
        assertBuffer(buf, [0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeUInt32LE(0x12345678), 4)
        assertBuffer(buf, [0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0])

        assert.equal(buf.writeBigUInt64LE(0x123456789abcdef0n), 8)
        assertBuffer(buf, [0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0])
      })

      it('writes at an offset', () => {
        let buf = Buffer.alloc(6)
        assert.equal(buf.writeUInt32BE(0x12345678, 2), 6)
        assertBuffer(buf, [0, 0, 0x12, 0x34, 0x56, 0x78])
      })

      it('fails to write past the end of the buffer', () => {
        let buf = Buffer.alloc(6)
        assert.throws(() => buf.writeUInt32BE(0x12345678, 3))
      })
    })

    describe('readInt()', () => {
      let buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x11, 0x22])

      it('reads a UIntXBE', () => {
        assert.equal(buf.readUInt8(), 0x12)
        assert.equal(buf.readUInt16BE(), 0x1234)
        assert.equal(buf.readUInt32BE(), 0x12345678)
        assert.equal(buf.readBigUInt64BE(), 0x123456789abcdef0n)
      })

      it('reads a UIntXBE at an offset', () => {
        assert.equal(buf.readUInt8(2), 0x56)
        assert.equal(buf.readUInt16BE(3), 0x789a)
        assert.equal(buf.readUInt32BE(1), 0x3456789a)
        assert.equal(buf.readBigUInt64BE(2), 0x56789abcdef01122n)
      })

      it('reads a UIntXLE', () => {
        assert.equal(buf.readUInt8(), 0x12)
        assert.equal(buf.readUInt16LE(), 0x3412)
        assert.equal(buf.readUInt32LE(), 0x78563412)
        assert.equal(buf.readBigUInt64LE(), 0xf0debc9a78563412n)
      })
    })
  })
}

if (typeof process !== 'undefined' && typeof Buffer !== 'undefined') {
  let version = process.version.match(/\d+/g).map((n) => parseInt(n, 10))
  if (version[0] >= 18) spec('native', Buffer)
}

spec('shim', require('../lib/buffer').Buffer)
