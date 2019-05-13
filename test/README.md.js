const assert = require('power-assert')

const sql = require('../')

function ignoreWhitespaces (string) {
  return string.replace(/\n/g, '').replace(/ {2,}/g, ' ').trim()
}

describe('sql', () => {
  it('translate the example for the SQL Tag correct with a name', () => {
    const name = 'raa'
    const page = 0

    const actual = sql`
      SELECT name, email FROM users
        WHERE
          validated IS NULL
          ${sql.if(name, sql`AND name LIKE ${`%${name}%`}`)}
        ${sql.pagination(page)}
    `

    const expected = {
      sql: ignoreWhitespaces(`
        SELECT name, email FROM users
          WHERE
            validated IS NULL
            AND name LIKE ?
          LIMIT 10 OFFSET 0
      `),
      values: ['%raa%']
    }
    assert.deepEqual({ sql: ignoreWhitespaces(actual.sql), values: actual.values }, expected)
  })
})
