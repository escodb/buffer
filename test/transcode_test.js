'use strict'

const { assert } = require('chai')
const { transcode, transcodeBE, transcodeLE } = require('../lib/codec/transcode')

const u8 = (...args) => new Uint8Array(...args)

function randomBytes (size) {
  let length = Math.floor(Math.random() * size)
  let array = new Uint8Array(length)

  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 0x100)
  }
  return array
}

describe('transcode()', () => {
  function checkConversion (inBits, outBits, input, output) {
    input  = u8(input)
    output = u8(output)

    let encoded = transcode(inBits, outBits, input)
    assert.deepEqual(encoded, output)

    let decoded = transcode(outBits, inBits, encoded)
    assert.deepEqual(decoded, input)
  }

  describe('bytes into sextets', () => {
    it('converts a complete block', () => {
      checkConversion(8, 6,
        [0b10110011, 0b10001111, 0b00001111],
        [0b101100, 0b111000, 0b111100, 0b001111])
    })

    it('converts a medium block', () => {
      checkConversion(8, 6,
        [0b10110011, 0b10001111],
        [0b101100, 0b111000, 0b111100, 0x3d])
    })

    it('converts a short block', () => {
      checkConversion(8, 6,
        [0b10110011],
        [0b101100, 0b110000, 0x3d, 0x3d])
    })

    it('applies the mapping function', () => {
      let input = u8([0b10110011, 0b10001111, 0b00001111])

      let encoded = transcode(8, 6, input, (n) => (n === 0b111000) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b101100, 0xff, 0b111100, 0b001111]))

      let decoded = transcode(6, 8, encoded, (n) => (n === 0xff) ? 0b111000 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(8, 6, subject, (n) => n + 0x40)
        let decoded = transcode(6, 8, encoded, (n) => n - 0x40)

        assert.equal(encoded.length % 4, 0)
        assert.deepEqual(decoded, subject)
      }
    })
  })

  describe('bytes into quintets', () => {
    it('converts a complete block', () => {
      checkConversion(8, 5,
        [0b10110011, 0b10001111, 0b00001111, 0b10000011, 0b11110000],
        [0b10110, 0b01110, 0b00111, 0b10000, 0b11111, 0b00000, 0b11111, 0b10000])
    })

    it('converts a 4-byte block', () => {
      checkConversion(8, 5,
        [0b10110011, 0b10001111, 0b00001111, 0b10000011],
        [0b10110, 0b01110, 0b00111, 0b10000, 0b11111, 0b00000, 0b11000, 0x3d])
    })

    it('converts a 3-byte block', () => {
      checkConversion(8, 5,
        [0b10110011, 0b10001111, 0b00001111],
        [0b10110, 0b01110, 0b00111, 0b10000, 0b11110, 0x3d, 0x3d, 0x3d])
    })

    it('converts a 2-byte block', () => {
      checkConversion(8, 5,
        [0b10110011, 0b10001111],
        [0b10110, 0b01110, 0b00111, 0b10000, 0x3d, 0x3d, 0x3d, 0x3d])
    })

    it('converts a 1-byte block', () => {
      checkConversion(8, 5,
        [0b10110011],
        [0b10110, 0b01100, 0x3d, 0x3d, 0x3d, 0x3d, 0x3d, 0x3d])
    })

    it('applies the mapping function', () => {
      let input = u8([0b10110011, 0b10001111, 0b00001111])

      let encoded = transcode(8, 5, input, (n) => (n === 0b01110) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b10110, 0xff, 0b00111, 0b10000, 0b11110, 0x3d, 0x3d, 0x3d]))

      let decoded = transcode(5, 8, encoded, (n) => (n === 0xff) ? 0b01110 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(8, 5, subject)
        let decoded = transcode(5, 8, encoded)

        assert.equal(encoded.length % 8, 0)
        assert.deepEqual(decoded, subject)
      }
    })
  })

  describe('bytes into nibbles', () => {
    it('converts a byte', () => {
      checkConversion(8, 4, [0b10110111], [0b1011, 0b0111])
    })

    it('applies the mapping function', () => {
      let input = u8([0b10110111])

      let encoded = transcode(8, 4, input, (n) => (n === 0b1011) ? 0xff : n)
      assert.deepEqual(encoded, u8([0xff, 0b0111]))

      let decoded = transcode(4, 8, encoded, (n) => (n === 0xff) ? 0b1011 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(8, 4, subject)
        let decoded = transcode(4, 8, encoded)

        assert.equal(encoded.length % 2, 0)
        assert.deepEqual(decoded, subject)
      }
    })
  })

  describe('bytes into triplets', () => {
    it('converts a complete block', () => {
      checkConversion(8, 3,
        [0b10110011, 0b10001111, 0b00001111],
        [0b101, 0b100, 0b111, 0b000, 0b111, 0b100, 0b001, 0b111])
    })

    it('converts a medium block', () => {
      checkConversion(8, 3,
        [0b10110011, 0b10001111],
        [0b101, 0b100, 0b111, 0b000, 0b111, 0b100, 0x3d, 0x3d])
    })

    it('converts a short block', () => {
      checkConversion(8, 3,
        [0b10110011],
        [0b101, 0b100, 0b110, 0x3d, 0x3d, 0x3d, 0x3d, 0x3d])
    })

    it('applies the mapping function', () => {
      let input = u8([0b10110011, 0b10001111])

      let encoded = transcode(8, 3, input, (n) => (n === 0b111) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b101, 0b100, 0xff, 0b000, 0xff, 0b100, 0x3d, 0x3d]))

      let decoded = transcode(3, 8, encoded, (n) => (n === 0xff) ? 0b111 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(8, 3, subject)
        let decoded = transcode(3, 8, encoded)

        assert.equal(encoded.length % 8, 0)
        assert.deepEqual(decoded, subject)
      }
    })
  })
})

describe('transcodeBE()', () => {
  it('converts u8 to u16', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeBE(8, 16, source, target)

    assert.deepEqual(target, new Uint16Array([0x1234, 0x5678, 0x9abc]))
  })

  it('converts u8 to u32', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    let target = new Uint32Array(1)

    transcodeBE(8, 32, source, target)

    assert.deepEqual(target, new Uint32Array([0x12345678]))
  })

  it('converts u32 to u16', () => {
    let source = new Uint32Array([0x12345678, 0xfedcba98])
    let target = new Uint16Array(4)

    transcodeBE(32, 16, source, target)

    assert.deepEqual(target, new Uint16Array([0x1234, 0x5678, 0xfedc, 0xba98]))
  })

  it('writes at a target offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeBE(8, 16, source, target, 2)

    assert.deepEqual(target, new Uint16Array([0, 0, 0x1234]))
  })

  it('reads from a source offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeBE(8, 16, source, target, 0, 2)

    assert.deepEqual(target, new Uint16Array([0x5678, 0x9abc, 0]))
  })

  it('reads up to a source offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeBE(8, 16, source, target, 0, 1, 5)

    assert.deepEqual(target, new Uint16Array([0x3456, 0x789a, 0]))
  })
})

describe('transcodeLE()', () => {
  it('converts u8 to u16', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeLE(8, 16, source, target)

    assert.deepEqual(target, new Uint16Array([0x3412, 0x7856, 0xbc9a]))
  })

  it('converts u8 to u32', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    let target = new Uint32Array(1)

    transcodeLE(8, 32, source, target)

    assert.deepEqual(target, new Uint32Array([0x78563412]))
  })

  it('converts u32 to u16', () => {
    let source = new Uint32Array([0x12345678, 0xfedcba98])
    let target = new Uint16Array(4)

    transcodeLE(32, 16, source, target)

    assert.deepEqual(target, new Uint16Array([0x5678, 0x1234, 0xba98, 0xfedc]))
  })

  it('writes at a target offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeLE(8, 16, source, target, 2)

    assert.deepEqual(target, new Uint16Array([0, 0, 0x3412]))
  })

  it('reads from a source offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeLE(8, 16, source, target, 0, 2)

    assert.deepEqual(target, new Uint16Array([0x7856, 0xbc9a, 0]))
  })

  it('reads up to a source offset', () => {
    let source = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc])
    let target = new Uint16Array(3)

    transcodeLE(8, 16, source, target, 0, 1, 5)

    assert.deepEqual(target, new Uint16Array([0x5634, 0x9a78, 0]))
  })
})
