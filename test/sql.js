const assert = require('power-assert')

const sql = require('../')

describe('sql', () => {
  it('return object with sql and values attribute', () => {
    const actual = sql`SELECT \`*\` FROM \`table\``

    const expected = {
      sql: 'SELECT `*` FROM `table`',
      values: []
    }
    assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
  })

  it('exchange primitive values', () => {
    const value1 = 'value1'
    const value2 = 'value2'
    const value3 = 'value3'

    const actual = sql`SELECT \`*\` FROM \`table\` WHERE \`column1\` = ${value1} AND \`column2\` = ${value2} AND \`column3\` = ${value3}`

    const expected = {
      sql: 'SELECT `*` FROM `table` WHERE `column1` = ? AND `column2` = ? AND `column3` = ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
  })

  it('use objects with sql', () => {
    const column1 = { sql: '`column1`', values: [] }
    const column2 = { sql: '`column2`', values: [] }
    const column3 = { sql: '`column3`', values: [] }

    const actual = sql`SELECT ${column1}, ${column2}, ${column3} FROM \`table\``

    const expected = {
      sql: 'SELECT `column1`, `column2`, `column3` FROM `table`',
      values: []
    }
    assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
  })

  it('use objects with text and values', () => {
    const condition1 = { sql: '`column1` = ?', values: ['value1'] }
    const condition2 = { sql: '`column2` = ?', values: ['value2'] }
    const condition3 = { sql: '`column3` = ?', values: ['value3'] }

    const actual = sql`SELECT \`*\` FROM \`table\` WHERE ${condition1} AND ${condition2} AND ${condition3}`

    const expected = {
      sql: 'SELECT `*` FROM `table` WHERE `column1` = ? AND `column2` = ? AND `column3` = ?',
      values: ['value1', 'value2', 'value3']
    }
    assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
  })
})
