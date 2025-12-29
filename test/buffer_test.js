'use strict'

const { assert } = require('chai')

function randomBytes (size) {
  let length = Math.floor(Math.random() * size)
  let array = new Array(length).fill(0)
  return array.map(() => Math.floor(Math.random() * 0x100))
}

function randomString (size) {
  let length = Math.floor(Math.random() * size)
  let cps = new Array(length).fill(0)
  cps = cps.map(() => randomRange([[0, 0xd7ff], [0xe000, 0x12fff]]))
  return String.fromCodePoint(...cps)
}

function randomRange (ranges) {
  let size = ranges.reduce((s, [a, b]) => s + 1 + b - a, 0)
  let n = Math.floor(Math.random() * size)

  for (let [a, b] of ranges) {
    if (a + n <= b) {
      return a + n
    } else {
      n -= 1 + b - a
    }
  }
}

function assertBuffer (buf, bytes) {
  assert.equal(buf.length, bytes.length)
  assert(bytes.every((b, i) => b === buf[i]))
}

const HELLO_WORLD = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]

function spec (name, Buffer) {
  describe(`Buffer: ${name}`, () => {
    describe('base64', () => {
      it('encodes to base64', () => {
        let buf = Buffer.from(HELLO_WORLD)
        assert.equal(buf.toString('base64'), 'aGVsbG8gd29ybGQ=')
      })

      it('decodes a string from base64', () => {
        let buf = Buffer.from('aGVsbG8gd29ybGQ=', 'base64')
        assertBuffer(buf, HELLO_WORLD)
      })

      it('decodes arbitrary bytes from base64', () => {
        let buf = Buffer.from('ACXZ+bgwy/019w==', 'base64')
        let bytes = [0x00, 0x25, 0xd9, 0xf9, 0xb8, 0x30, 0xcb, 0xfd, 0x35, 0xf7]
        assertBuffer(buf, bytes)
        assert.equal(buf.toString('base64'), 'ACXZ+bgwy/019w==')
      })

      it('converts to and from base64', () => {
        for (let i = 0; i < 100; i++) {
          let bytes = randomBytes(200)
          let buf = Buffer.from(bytes)

          let str = buf.toString('base64')
          assert.equal(str.length, 4 * Math.ceil(buf.length / 3))
          assert.match(str, /^[A-Za-z0-9+/]*={0,2}$/)

          let parsed = Buffer.from(str, 'base64')
          assertBuffer(parsed, bytes)
        }
      })
    })

    describe('hex', () => {
      it('encodes to hex', () => {
        let buf = Buffer.from(HELLO_WORLD)
        assert.equal(buf.toString('hex'), '68656c6c6f20776f726c64')
      })

      it('decodes a string from hex', () => {
        let buf = Buffer.from('68656c6c6f20776f726c64', 'hex')
        assertBuffer(buf, HELLO_WORLD)
      })

      it('decodes from uppercase hex', () => {
        let buf = Buffer.from('CAFE', 'hex')
        assertBuffer(buf, [0xca, 0xfe])
      })

      it('converts to and from hex', () => {
        for (let i = 0; i < 100; i++) {
          let bytes = randomBytes(200)
          let buf = Buffer.from(bytes)

          let str = buf.toString('hex')
          assert.equal(str.length, 2 * buf.length)
          assert.match(str, /^[0-9a-f]*$/)

          let parsed = Buffer.from(str, 'hex')
          assertBuffer(parsed, bytes)
        }
      })
    })

    describe('utf8', () => {
      it('decodes ASCII codepoints', () => {
        let buf = Buffer.from('abc123()', 'utf8')
        let bytes = [0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x28, 0x29]
        assertBuffer(buf, bytes)
      })

      it('encodes ASCII codepoints', () => {
        let buf = Buffer.from([0x61, 0x62, 0x63, 0x31, 0x32, 0x33, 0x28, 0x29])
        assert.equal(buf.toString('utf8'), 'abc123()')
      })

      it('decodes 2-byte codepoints', () => {
        let buf = Buffer.from('£§±ɚߠ', 'utf8')
        let bytes = [0xc2, 0xa3, 0xc2, 0xa7, 0xc2, 0xb1, 0xc9, 0x9a, 0xdf, 0xa0]
        assertBuffer(buf, bytes)
      })

      it('encodes 2-byte codepoints', () => {
        let buf = Buffer.from([0xc2, 0xa3, 0xc2, 0xa7, 0xc2, 0xb1, 0xc9, 0x9a, 0xdf, 0xa0])
        assert.equal(buf.toString('utf8'), '£§±ɚߠ')
      })

      it('decodes 3-byte codepoints', () => {
        let buf = Buffer.from('ॡန〛亏', 'utf8')
        let bytes = [0xe0, 0xa5, 0xa1, 0xe1, 0x80, 0x94, 0xe3, 0x80, 0x9b, 0xe4, 0xba, 0x8f]
        assertBuffer(buf, bytes)
      })

      it('encodes 3-byte codepoints', () => {
        let buf = Buffer.from([0xe0, 0xa5, 0xa1, 0xe1, 0x80, 0x94, 0xe3, 0x80, 0x9b, 0xe4, 0xba, 0x8f])
        assert.equal(buf.toString('utf8'), 'ॡန〛亏')
      })

      it('decodes 4-byte codepoints', () => {
        let buf = Buffer.from('look: 😱!', 'utf8')
        let bytes = [0x6c, 0x6f, 0x6f, 0x6b, 0x3a, 0x20, 0xf0, 0x9f, 0x98, 0xb1, 0x21]
        assertBuffer(buf, bytes)
      })

      it('encodes 4-byte codepoints', () => {
        let buf = Buffer.from([0x6c, 0x6f, 0x6f, 0x6b, 0x3a, 0x20, 0xf0, 0x9f, 0x98, 0xb1, 0x21])
        assert.equal(buf.toString('utf8'), 'look: 😱!')
      })

      it('converts to and from utf8', () => {
        for (let i = 0; i < 100; i++) {
          let str = randomString(200)
          let buf = Buffer.from(str, 'utf8')
          assert.equal(buf.toString('utf8'), str)
        }
      })
    })

    describe('copy()', () => {
      let source = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9a])

      it('copies the source to the start of the target', () => {
        let target = Buffer.alloc(8)
        source.copy(target)
        assertBuffer(target, [0x12, 0x34, 0x56, 0x78, 0x9a, 0, 0, 0])
      })

      it('copies the source to a non-zero offset', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 2)
        assertBuffer(target, [0, 0, 0x12, 0x34, 0x56, 0x78, 0x9a, 0])
      })

      it('copies the source near the end of the target', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 5)
        assertBuffer(target, [0, 0, 0, 0, 0, 0x12, 0x34, 0x56])
      })

      it('copies a source to a smaller target', () => {
        let target = Buffer.alloc(3)
        source.copy(target)
        assertBuffer(target, [0x12, 0x34, 0x56])
      })

      it('copies a source to a smaller target with an offset', () => {
        let target = Buffer.alloc(3)
        source.copy(target, 2)
        assertBuffer(target, [0, 0, 0x12])
      })

      it('copies a slice of the source', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 0, 0, 3)
        source.copy(target, 5, 2, 4)
        assertBuffer(target, [0x12, 0x34, 0x56, 0, 0, 0x56, 0x78, 0])
      })

      it('fails to copy before the start of the target', () => {
        let target = Buffer.alloc(8)
        assert.throws(() => source.copy(target, -1))
      })

      it('copies past the end of the target', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 10)
        assertBuffer(target, [0, 0, 0, 0, 0, 0, 0, 0])
      })

      it('fails to copy starting past the end of the source', () => {
        let target = Buffer.alloc(8)
        assert.throws(() => source.copy(target, 0, 6))
      })

      it('copies ending past the end of the source', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 1, 2, 6)
        assertBuffer(target, [0, 0x56, 0x78, 0x9a, 0, 0, 0, 0])
      })

      it('copies when the source offsets are not ordered', () => {
        let target = Buffer.alloc(8)
        source.copy(target, 1, 4, 2)
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

        buf.writeInt8(0x56)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt8(-0x56)
        assertBuffer(buf, [0xaa, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt16BE(0x1234)
        assertBuffer(buf, [0x12, 0x34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt16BE(-0x1234)
        assertBuffer(buf, [0xed, 0xcc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt32BE(0x12345678)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt32BE(-0x12345678)
        assertBuffer(buf, [0xed, 0xcb, 0xa9, 0x88, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeBigInt64BE(0x123456789abcdef0n)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0, 0, 0, 0])

        buf.writeBigInt64BE(-0x123456789abcdef0n)
        assertBuffer(buf, [0xed, 0xcb, 0xa9, 0x87, 0x65, 0x43, 0x21, 0x10, 0, 0, 0, 0])
      })

      it('writes a UIntXBE', () => {
        let buf = Buffer.alloc(12)

        buf.writeUInt8(0x56)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeUInt16BE(0x1234)
        assertBuffer(buf, [0x12, 0x34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeUInt32BE(0x12345678)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeBigUInt64BE(0x123456789abcdef0n)
        assertBuffer(buf, [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0, 0, 0, 0])
      })

      it('writes an IntXLE', () => {
        let buf = Buffer.alloc(12)

        buf.writeInt8(0x56)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt8(-0x56)
        assertBuffer(buf, [0xaa, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt16LE(0x1234)
        assertBuffer(buf, [0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt16LE(-0x1234)
        assertBuffer(buf, [0xcc, 0xed, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt32LE(0x12345678)
        assertBuffer(buf, [0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeInt32LE(-0x12345678)
        assertBuffer(buf, [0x88, 0xa9, 0xcb, 0xed, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeBigInt64LE(0x123456789abcdef0n)
        assertBuffer(buf, [0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0])

        buf.writeBigInt64LE(-0x123456789abcdef0n)
        assertBuffer(buf, [0x10, 0x21, 0x43, 0x65, 0x87, 0xa9, 0xcb, 0xed, 0, 0, 0, 0])
      })

      it('writes a UIntXLE', () => {
        let buf = Buffer.alloc(12)

        buf.writeUInt8(0x56)
        assertBuffer(buf, [0x56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeUInt16LE(0x1234)
        assertBuffer(buf, [0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeUInt32LE(0x12345678)
        assertBuffer(buf, [0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0, 0, 0, 0, 0])

        buf.writeBigUInt64LE(0x123456789abcdef0n)
        assertBuffer(buf, [0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12, 0, 0, 0, 0])
      })

      it('writes at an offset', () => {
        let buf = Buffer.alloc(6)
        buf.writeUInt32BE(0x12345678, 2)
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

spec('shim', require('../lib/buffer'))
