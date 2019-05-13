const assert = require('power-assert')

const sql = require('../../')

describe('sql.if', () => {
  it('use the then given value in a truly case', () => {
    const actual = sql.if(true, { sql: 'true', values: [] })
    const expected = { sql: 'true', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the else default value in a falsy case', () => {
    const actual = sql.if(false, { sql: 'true', values: [] })
    const expected = { sql: '', values: [] }
    assert.deepEqual(actual, expected)
  })

  it('use the else given value in a falsy case', () => {
    const actual = sql.if(false, { sql: 'true', values: [] }, { sql: 'false', values: [] })
    const expected = { sql: 'false', values: [] }
    assert.deepEqual(actual, expected)
  })
})
