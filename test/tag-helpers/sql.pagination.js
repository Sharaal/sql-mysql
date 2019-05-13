const assert = require('power-assert')

describe('sql.pagination', () => {
  let sql
  beforeEach(() => {
    sql = require('../../')
    sql.defaultPageSize = 10
  })

  it('use the given page and normal default pageSize to set limit and offset', () => {
    const actual = sql.pagination(5)
    const expected = { sql: 'LIMIT 10 OFFSET 50', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the first page if there is not a positive page given', () => {
    const actual = sql.pagination(NaN)
    const expected = { sql: 'LIMIT 10 OFFSET 0', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the given page and overwritten default pageSize to set limit and offset', () => {
    sql.defaultPageSize = 15
    const actual = sql.pagination(5)
    const expected = { sql: 'LIMIT 15 OFFSET 75', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the given page and given pageSize to set limit and offset', () => {
    const actual = sql.pagination(5, { pageSize: 15 })
    const expected = { sql: 'LIMIT 15 OFFSET 75', values: [] }
    assert.deepEqual(actual, expected)
  })
})
