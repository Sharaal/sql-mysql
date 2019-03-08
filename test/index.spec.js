const assert = require('power-assert')

const sql = require('../')

describe('sql-mysql', () => {
  describe('extract and bind values', () => {
    it('should work with one value inside the query', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE id = ? AND state = \'active\'',
        parameters: ['id']
      }

      const id = 'id'

      let actual = sql`SELECT * FROM users WHERE id = ${id} AND state = 'active'`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with one value at the end of the query', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE id = ?',
        parameters: ['id']
      }

      const id = 'id'

      let actual = sql`SELECT * FROM users WHERE id = ${id}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple values', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE email = ? AND passwordhash = ?',
        parameters: ['email', 'passwordhash']
      }

      const email = 'email'
      const passwordhash = 'passwordhash'

      let actual = sql`SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('escape keys for tables and columns', () => {
    it('should work with one key', () => {
      const expected = {
        text: 'SELECT * FROM "users"',
        parameters: []
      }

      const table = 'users'

      let actual = sql`SELECT * FROM ${sql.key(table)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with a list of keys array based', () => {
      const expected = {
        text: 'SELECT "id", "email" FROM users',
        parameters: []
      }

      const columns = ['id', 'email']

      let actual = sql`SELECT ${sql.keys(columns)} FROM users`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with a list of keys object based', () => {
      const expected = {
        text: 'SELECT "id", "email" FROM users',
        parameters: []
      }

      const user = { id: 'id', email: 'email' }

      let actual = sql`SELECT ${sql.keys(user)} FROM users`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('support list of values', () => {
    it('should work with one value in the value list', () => {
      const expected = {
        text: 'INSERT INTO users (email) VALUES (?)',
        parameters: ['email']
      }

      const values = ['email']

      let actual = sql`INSERT INTO users (email) VALUES (${sql.values(values)})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple values in the value list array based', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        parameters: ['email', 'passwordhash']
      }

      const values = ['email', 'passwordhash']

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(values)})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple values in the value list object based', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        parameters: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('support multiple list of values', () => {
    it('should work with multiple list of values array based', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?), (?, ?)',
        parameters: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
      }

      const valuesList = [
        ['emailA', 'passwordhashA'],
        ['emailB', 'passwordhashB']
      ]

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES ${sql.valuesList(valuesList)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple list of values object based', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?), (?, ?)',
        parameters: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
      }

      const users = [
        { email: 'emailA', passwordhash: 'passwordhashA' },
        { email: 'emailB', passwordhash: 'passwordhashB' }
      ]

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES ${sql.valuesList(users)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Support pairs of column keys and values using as set of updates', () => {
    it('should work with one pair', () => {
      const expected = {
        text: 'UPDATE users SET "email" = ? WHERE id = \'id\'',
        parameters: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`UPDATE users SET ${sql.pairs(user, ', ')} WHERE id = 'id'`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        text: 'UPDATE users SET "email" = ?, "passwordhash" = ? WHERE id = \'id\'',
        parameters: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`UPDATE users SET ${sql.pairs(user, ', ')} WHERE id = 'id'`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Support pairs of column keys and values using as set of conditions', () => {
    it('should work with one pair', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE "email" = ?',
        parameters: ['email']
      }

      const user = { email: 'email' }

      let actual = sql`SELECT * FROM users WHERE ${sql.pairs(user, ' AND ')}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with multiple pairs', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE "email" = ? AND "passwordhash" = ?',
        parameters: ['email', 'passwordhash']
      }

      const user = { email: 'email', passwordhash: 'passwordhash' }

      let actual = sql`SELECT * FROM users WHERE ${sql.pairs(user, ' AND ')}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Support for nested queries', () => {
    it('should work, especially the renumbering of the binds', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE state = ? AND id = (SELECT id FROM users WHERE email = ? AND passwordhash = ?)',
        parameters: ['active', 'email', 'passwordhash']
      }

      const state = 'active'
      const email = 'email'
      const passwordhash = 'passwordhash'

      let actual = sql`SELECT * FROM users WHERE state = ${state} AND id = (${sql`SELECT id FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}`})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Support for limit, offset and pagination', () => {
    it('should work with right values', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 10 OFFSET 20',
        parameters: []
      }

      const limit = 10
      const offset = 20

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with 0 values by using the fallbacks', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 1 OFFSET 0',
        parameters: []
      }

      const limit = 0
      const offset = 0

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with non number values by using the fallbacks', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 1 OFFSET 0',
        parameters: []
      }

      const limit = 'example'
      const offset = 'example'

      let actual = sql`SELECT * FROM users ${sql.limit(limit)} ${sql.offset(offset)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with the pagination shorthand', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 10 OFFSET 50',
        parameters: []
      }

      const page = 5
      const pageSize = 10

      let actual = sql`SELECT * FROM users ${sql.pagination(page, pageSize)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work if the actualLimit is higher than the maxLimit', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 10',
        parameters: []
      }

      const actualLimit = 50
      const maxLimit = 10

      let actual = sql`SELECT * FROM users ${sql.limit(actualLimit, maxLimit)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Extend with own fragment methods', () => {
    it('should work with using parameterPosition in fragment method', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        parameters: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
      }

      const bcrypt = {
        hashSync: () => '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6'
      }

      sql.passwordhash = (password, saltRounds = 10) => ({
        text: '?',
        parameters: [bcrypt.hashSync(password, saltRounds)]
      })

      const user = { email: 'email' }
      const password = 'password'

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with reusing existing fragment method', () => {
      const expected = {
        text: 'INSERT INTO users (email, passwordhash) VALUES (?, ?)',
        parameters: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
      }

      const bcrypt = {
        hashSync: () => '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6'
      }

      sql.passwordhash = (password, saltRounds = 10) => sql.values([bcrypt.hashSync(password, saltRounds)])

      const user = { email: 'email' }
      const password = 'password'

      let actual = sql`INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with fragment method returning directly result object', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE active = true',
        parameters: []
      }

      sql.active = active => ({
        text: active ? 'active = true' : '1',
        parameters: []
      })

      const active = true

      let actual = sql`SELECT * FROM users WHERE ${sql.active(active)}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should work with constant result object', () => {
      const expected = {
        text: 'SELECT * FROM users LIMIT 1',
        parameters: []
      }

      sql.first = {
        text: `LIMIT 1`,
        parameters: []
      }

      let actual = sql`SELECT * FROM users ${sql.first}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Right handling of "?" in text fragments', () => {
    it('should not accidentally replace "?" with numbered binding in text fragments', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE email = "?"',
        parameters: []
      }

      let actual = sql`SELECT * FROM users WHERE email = "?"`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should not accidentally replace "?" with numbered binding in nested query text fragments', () => {
      const expected = {
        text: 'SELECT * FROM (SELECT * FROM users WHERE email = "?") tmp',
        parameters: []
      }

      let actual = sql`SELECT * FROM (${sql`SELECT * FROM users WHERE email = "?"`}) tmp`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })

  describe('Right handling of "?" in bindings', () => {
    it('should bind reservered "?" correctly if given as binding', () => {
      const expected = {
        text: 'SELECT * FROM users WHERE email = ?',
        parameters: ['?']
      }

      let actual = sql`SELECT * FROM users WHERE email = ${'?'}`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })

    it('should bind reservered "?" correctly if given as binding in nested query', () => {
      const expected = {
        text: 'SELECT * FROM (SELECT * FROM users WHERE email = ?) tmp',
        parameters: ['?']
      }

      let actual = sql`SELECT * FROM (${sql`SELECT * FROM users WHERE email = ${'?'}`}) tmp`

      assert.deepEqual({ text: actual.text, parameters: actual.parameters }, expected)
    })
  })
})
