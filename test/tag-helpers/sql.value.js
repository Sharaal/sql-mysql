const assert = require('power-assert')

const sql = require('../../')

describe('sql.value', () => {
  it('should exchange the given value', () => {
    const actual = sql.value('value')

    const expected = {
      sql: '?',
      values: ['value']
    }
    assert.deepEqual(actual, expected)
  })
})
