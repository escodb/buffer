'use strict'

const { Buffer } = require('../lib/buffer')
const { assert } = require('chai')

function randomBytes (size) {
  let length = Math.floor(Math.random() * size)
  let array = new Array(length).fill(0)
  return array.map(() => Math.floor(Math.random() * 0x100))
}

function assertBuffer (buf, bytes) {
  assert.equal(buf.length, bytes.length)
  assert(bytes.every((b, i) => b === buf[i]))
}

describe('Buffer', () => {
  describe('base64', () => {
    it('encodes to base64', () => {
      let bytes = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]
      let buf = Buffer.from(bytes)
      assert.equal(buf.toString('base64'), 'aGVsbG8gd29ybGQ=')
    })

    it('decodes from base64', () => {
      let buf = Buffer.from('aGVsbG8gd29ybGQ=', 'base64')
      let bytes = [0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]
      assertBuffer(buf, bytes)
    })

    it('converts to and from base64', () => {
      for (let i = 0; i < 100; i++) {
        let bytes = randomBytes(200)
        let buf = Buffer.from(bytes)

        let str = buf.toString('base64')
        assert.equal(str.length % 4, 0)
        assert.match(str, /^[A-Za-z0-9+/]*={0,2}$/)

        let parsed = Buffer.from(str, 'base64')
        assertBuffer(parsed, bytes)
      }
    })
  })
})
