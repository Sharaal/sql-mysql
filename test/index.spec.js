const assert = require('power-assert')

const sql = require('../')

describe('sql-mysql', () => {
  describe('extract and bind values', () => {
    it('should work with one value inside the query', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE id = ? AND state = \'active\'',
        values: ['id']
      }

      const id = 'id'

      let actual = sql`SELECT * FROM users WHERE id = ${id} AND state = 'active'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with one value at the end of the query', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE id = ?',
        values: ['id']
      }

      const id = 'id'

      let actual = sql`SELECT * FROM users WHERE id = ${id}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple values', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE email = ? AND passwordhash = ?',
        values: ['email', 'passwordhash']
      }

      const email = 'email'
      const passwordhash = 'passwordhash'

      let actual = sql`SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('escape keys for tables and columns', () => {
    it('should work with one key', () => {
      const expected = {
        sql: 'SELECT * FROM `users`',
        values: []
      }

      const table = 'users'

      let actual = sql`SELECT * FROM ${sql.key(table)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with a list of keys array based', () => {
      const expected = {
        sql: 'SELECT `id`, `email` FROM users',
        values: []
      }

      const columns = ['id', 'email']

      let actual = sql`SELECT ${sql.keys(columns)} FROM users`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with a list of keys object based', () => {
      const expected = {
        sql: 'SELECT `id`, `email` FROM users',
        values: []
      }

      const user = { id: 'id', email: 'email' }

      let actual = sql`SELECT ${sql.keys(user)} FROM users`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('support list of values', () => {
    it('should work with one value in the value list', () => {
      const expected = {
        sql: 'INSERT INTO users (email) VALUES (?)',
        values: ['email']
      }

      const values = ['email']

      let actual = sql`INSERT INTO users (email) VALUES (${sql.values(values)})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple values in the value list array based', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        values: ['email', 'passwordhash']
      }

      const values = ['email', 'passwordhash']

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(values)})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple values in the value list object based', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        values: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('support multiple list of values', () => {
    it('should work with multiple list of values array based', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?), (?, ?)',
        values: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
      }

      const valuesList = [
        ['emailA', 'passwordhashA'],
        ['emailB', 'passwordhashB']
      ]

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES ${sql.valuesList(valuesList)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple list of values object based', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?), (?, ?)',
        values: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
      }

      const users = [
        { email: 'emailA', passwordhash: 'passwordhashA' },
        { email: 'emailB', passwordhash: 'passwordhashB' }
      ]

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES ${sql.valuesList(users)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support assignments for updates', () => {
    it('should work with one pair', () => {
      const expected = {
        sql: 'UPDATE users SET `email` = ? WHERE id = \'id\'',
        values: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`UPDATE users SET ${sql.assignments(user)} WHERE id = 'id'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        sql: 'UPDATE users SET `email` = ?, `passwordhash` = ? WHERE id = \'id\'',
        values: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`UPDATE users SET ${sql.assignments(user)} WHERE id = 'id'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support pairs of column keys and values using as alternative of assignments for updates', () => {
    it('should work with one pair', () => {
      const expected = {
        sql: 'UPDATE users SET `email` = ? WHERE id = \'id\'',
        values: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`UPDATE users SET ${sql.pairs(user, ', ')} WHERE id = 'id'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        sql: 'UPDATE users SET `email` = ?, `passwordhash` = ? WHERE id = \'id\'',
        values: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`UPDATE users SET ${sql.pairs(user, ', ')} WHERE id = 'id'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support conditions for basic use cases', () => {
    it('should work with one pair', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE `email` = ?',
        values: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`SELECT * FROM users WHERE ${sql.conditions(user)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE `email` = ? AND `passwordhash` = ?',
        values: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`SELECT * FROM users WHERE ${sql.conditions(user)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support pairs of column keys and values using as alternative of conditions', () => {
    it('should work with one pair', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE `email` = ?',
        values: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`SELECT * FROM users WHERE ${sql.pairs(user, ' AND ')}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE `email` = ? AND `passwordhash` = ?',
        values: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`SELECT * FROM users WHERE ${sql.pairs(user, ' AND ')}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support for nested queries', () => {
    it('should work, especially the renumbering of the binds', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE state = ? AND id = (SELECT id FROM users WHERE email = ? AND passwordhash = ?)',
        values: ['active', 'email', 'passwordhash']
      }

      const state = 'active'
      const email = 'email'
      const passwordhash = 'passwordhash'

      let actual = sql`SELECT * FROM users WHERE state = ${state} AND id = (${sql`SELECT id FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}`})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Support for limit, offset and pagination', () => {
    it('should work with right values', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 10 OFFSET 20',
        values: []
      }

      const limit = 10
      const offset = 20

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with 0 values by using the fallbacks', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 1 OFFSET 0',
        values: []
      }

      const limit = 0
      const offset = 0

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with non number values by using the fallbacks', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 1 OFFSET 0',
        values: []
      }

      const limit = 'example'
      const offset = 'example'

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with the pagination shorthand', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 10 OFFSET 50',
        values: []
      }

      const page = 5
      const pageSize = 10

      let actual = sql`SELECT * FROM users ${sql.pagination(page, pageSize)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work if the actualLimit is higher than the maxLimit', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 10',
        values: []
      }

      const actualLimit = 50
      const maxLimit = 10

      let actual = sql`SELECT * FROM users ${sql.limit(actualLimit, maxLimit)}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Extend with own fragment methods', () => {
    it('should work to define own fragment methods by adding them to the `sql` tag', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        values: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
      }

      const bcrypt = {
        hashSync: () => '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6'
      }

      sql.passwordhash = (password, saltRounds = 10) => ({
        sql: '?',
        values: [bcrypt.hashSync(password, saltRounds)]
      })

      const user = { email: 'email' }
      const password = 'password'

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with reusing existing fragment method', () => {
      const expected = {
        sql: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        values: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
      }

      const bcrypt = {
        hashSync: () => '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6'
      }

      sql.passwordhash = (password, saltRounds = 10) => sql.values([bcrypt.hashSync(password, saltRounds)])

      const user = { email: 'email' }
      const password = 'password'

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should work with constant result object', () => {
      const expected = {
        sql: 'SELECT * FROM users LIMIT 1',
        values: []
      }

      sql.first = {
        sql: `LIMIT 1`,
        values: []
      }

      let actual = sql`SELECT * FROM users ${sql.first}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Right handling of \'?\' in sql fragments', () => {
    it('should not accidentally replace \'?\' with numbered binding in sql fragments', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE email = \'?\'',
        values: []
      }

      let actual = sql`SELECT * FROM users WHERE email = '?'`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should not accidentally replace \'?\' with numbered binding in nested query sql fragments', () => {
      const expected = {
        sql: 'SELECT * FROM (SELECT * FROM users WHERE email = \'?\') tmp',
        values: []
      }

      let actual = sql`SELECT * FROM (${sql`SELECT * FROM users WHERE email = '?'`}) tmp`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })

  describe('Right handling of \'?\' in bindings', () => {
    it('should bind reservered \'?\' correctly if given as binding', () => {
      const expected = {
        sql: 'SELECT * FROM users WHERE email = ?',
        values: ['?']
      }

      let actual = sql`SELECT * FROM users WHERE email = ${'?'}`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })

    it('should bind reservered \'?\' correctly if given as binding in nested query', () => {
      const expected = {
        sql: 'SELECT * FROM (SELECT * FROM users WHERE email = ?) tmp',
        values: ['?']
      }

      let actual = sql`SELECT * FROM (${sql`SELECT * FROM users WHERE email = ${'?'}`}) tmp`

      assert.deepEqual({ sql: actual.sql, values: actual.values }, expected)
    })
  })
})
