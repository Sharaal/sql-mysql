const assert = require('power-assert')

const sql = require('../../')

describe('sql.values', () => {
  it('exchange the given values', () => {
    const actual = sql.values(['value1', 'value2', 'value3'])

    const expected = {
      sql: '?, ?, ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual(actual, expected)
  })

  it('exchange the values of the given objects', () => {
    const actual = sql.values({ column1: 'value1', column2: 'value2', column3: 'value3' })

    const expected = {
      sql: '?, ?, ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual(actual, expected)
  })

  it('exchange only the values of the given keys of the given objects', () => {
    const actual = sql.values(
      { column1: 'value1', column2: 'value2', column3: 'value3', column4: 'value4' },
      { keys: ['column1', 'column2'] }
    )

    const expected = {
      sql: '?, ?',
      values: ['value1', 'value2']
    }
    assert.deepEqual(actual, expected)
  })
})
