const assert = require('power-assert')

const sql = require('../../')

describe('sql.conditions', () => {
  it('use the given object to build conditions', () => {
    const actual = sql.conditions({
      column1: 'value1',
      column2: 'value2',
      column3: 'value3'
    })

    const expected = {
      sql: '`column1` = ? AND `column2` = ? AND `column3` = ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual(actual, expected)
  })
})
