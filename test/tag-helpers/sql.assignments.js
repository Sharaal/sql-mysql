const assert = require('power-assert')

const sql = require('../../')

describe('sql.assignments', () => {
  it('use the given object to build assignments', () => {
    const actual = sql.assignments({
      column1: 'value1',
      column2: 'value2',
      column3: 'value3'
    })

    const expected = {
      sql: '`column1` = ?, `column2` = ?, `column3` = ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual(actual, expected)
  })
})
