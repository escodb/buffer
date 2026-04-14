'use strict'

const { assert } = require('chai')
const transcode = require('../lib/codec/transcode')

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

    let encoded = transcode(input, inBits, outBits)
    assert.deepEqual(encoded, output)

    let decoded = transcode(encoded, outBits, inBits)
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

      let encoded = transcode(input, 8, 6, (n) => (n === 0b111000) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b101100, 0xff, 0b111100, 0b001111]))

      let decoded = transcode(encoded, 6, 8, (n) => (n === 0xff) ? 0b111000 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(subject, 8, 6, (n) => n + 0x40)
        let decoded = transcode(encoded, 6, 8, (n) => n - 0x40)

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

      let encoded = transcode(input, 8, 5, (n) => (n === 0b01110) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b10110, 0xff, 0b00111, 0b10000, 0b11110, 0x3d, 0x3d, 0x3d]))

      let decoded = transcode(encoded, 5, 8, (n) => (n === 0xff) ? 0b01110 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(subject, 8, 5)
        let decoded = transcode(encoded, 5, 8)

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

      let encoded = transcode(input, 8, 4, (n) => (n === 0b1011) ? 0xff : n)
      assert.deepEqual(encoded, u8([0xff, 0b0111]))

      let decoded = transcode(encoded, 4, 8, (n) => (n === 0xff) ? 0b1011 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(subject, 8, 4)
        let decoded = transcode(encoded, 4, 8)

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

      let encoded = transcode(input, 8, 3, (n) => (n === 0b111) ? 0xff : n)
      assert.deepEqual(encoded, u8([0b101, 0b100, 0xff, 0b000, 0xff, 0b100, 0x3d, 0x3d]))

      let decoded = transcode(encoded, 3, 8, (n) => (n === 0xff) ? 0b111 : n)
      assert.deepEqual(decoded, input)
    })

    it('converts random arrays', () => {
      for (let i = 0; i < 100; i++) {
        let subject = randomBytes(1024)
        let encoded = transcode(subject, 8, 3)
        let decoded = transcode(encoded, 3, 8)

        assert.equal(encoded.length % 8, 0)
        assert.deepEqual(decoded, subject)
      }
    })
  })
})
