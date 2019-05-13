const assert = require('power-assert')

const sql = require('../../')

describe('sql.key', () => {
  it('escapes the given key', () => {
    const actual = sql.key('column')
    const expected = {
      sql: '`column`',
      values: []
    }
    assert.deepEqual(actual, expected)
  })

  it('escapes the given unsecure key', () => {
    const actual = sql.key('column`column')
    const expected = {
      sql: '`column``column`',
      values: []
    }
    assert.deepEqual(actual, expected)
  })
})
