const assert = require('power-assert')

const sql = require('../../')

describe('sql.offset', () => {
  it('use the given positive number', () => {
    const actual = sql.offset(5)
    const expected = { sql: 'OFFSET 5', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the fallback if there is not a positive number given', () => {
    const actual = sql.offset(NaN)
    const expected = { sql: 'OFFSET 0', values: [] }
    assert.deepEqual(actual, expected)
  })
})
