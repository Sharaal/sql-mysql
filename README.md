Complex queries can be written with normal SQL, including the values needs to be bound and prefixed with the `sql` tag.

The package is highly inspired by [slonik](https://www.npmjs.com/package/slonik) and the article having a critical look at [knex](https://www.npmjs.com/package/knex):

https://medium.com/@gajus/stop-using-knex-js-and-earn-30-bf410349856c

Special thanks to [gajus](https://github.com/gajus).

Also it's more a research than a production ready package to understand the concepts behind in deep and get more experience in working effectively with SQL.

# Initialization

```javascript
const sql = require('sql-mysql')
```

# Syntax Highlighting

## Atom

1. Install `language-babel` package
2. In the settings of this package search for "JavaScript Tagged Template Literals Grammar Extensions" and add the support for SQL via `sql:source.sql`
3. If it doesn't work disable "Use Tree Sitter Parsers" in the core settings

# Alternative databases

* PostgreSQL: [sql-pg](https://www.npmjs.com/package/sql-pg)

# Examples

## Extract and bind values

```javascript
const email = 'email'
const passwordhash = 'passwordhash'

const result = await client.query(sql`
  SELECT * FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}
`)

// sql: SELECT * FROM users WHERE email = ? AND passwordhash = ?
// values: ['email', 'passwordhash']
```

## Escape keys for tables and columns

```javascript
const table = 'users'
const columns = ['id', 'email']

const result = await client.query(sql`
  SELECT ${sql.keys(columns)} FROM ${sql.key(table)}
`)

// sql: SELECT "id", "email" FROM "users"
// values: []
```

If the parameter is an object (e.g. a user) the keys of the object will be used:

```javascript
const user = { id: 'id', email: 'email' }

const result = await client.query(sql`
  SELECT ${sql.keys(user)} FROM users
`)

// sql: SELECT "id", "email" FROM "users"
// values: []
```

## Support list of values

```javascript

const values = ['email', 'passwordhash']

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES (${sql.values(values)})
`)

// sql: INSERT INTO users (email, passwordhash) VALUES (?, ?)
// values: ['email', 'passwordhash']
```

If the parameter is an object (e.g. a user) the values of the object will be used:

```javascript
const user = { email: 'email', passwordhash: 'passwordhash' }

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)})
`)

// sql: INSERT INTO users (email, passwordhash) VALUES (?, ?)
// values: ['email', 'passwordhash']
```

## Support multiple list of values

```javascript
const valuesList = [
  ['emailA', 'passwordhashA'],
  ['emailB', 'passwordhashB']
]

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES ${sql.values(valuesList)}
`)

// sql: INSERT INTO users (email, passwordhash) VALUES (?, ?), (?, ?)
// values: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
```

If the parameter is an array of objects (e.g. list of users) the values of the objects will be used:

```javascript
const users = [
  { email: 'emailA', passwordhash: 'passwordhashA' },
  { email: 'emailB', passwordhash: 'passwordhashB' }
]

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES ${sql.values(users)}
`)

// sql: INSERT INTO users (email, passwordhash) VALUES ($1, $2), ($3, $4)
// values: ['emailA', 'passwordhashA', 'emailB', 'passwordhashB']
```

## Support pairs of column keys and values using as set of updates

```javascript
const user = { email: 'email', passwordhash: 'passwordhash' }

const result = await client.query(sql`
  UPDATE users SET ${sql.pairs(user, ', ')} WHERE id = 'id'
`)

// sql: UPDATE users SET "email" = $1, "passwordhash" = $2 WHERE id = 'id'
// values: ['email', 'passwordhash']
```

## Support pairs of column keys and values using as set of conditions

```javascript
const user = { email: 'email', passwordhash: 'passwordhash' }

const result = await client.query(sql`
  SELECT * FROM users WHERE ${sql.pairs(user, ' AND ')}
`)

// sql: SELECT * FROM users WHERE "email" = $1 AND "passwordhash" = $2
// values: ['email', 'passwordhash']
```

## Support for nested queries

```javascript
const state = 'active'
const email = 'email'
const passwordhash = 'passwordhash'

const result = await client.query(sql`
  SELECT * FROM users WHERE
    state = ${state}
    AND
    id = (${sql`SELECT id FROM users WHERE email = ${email} AND passwordhash = ${passwordhash}`})
`)

// sql: SELECT * FROM users WHERE
//         state = $1
//         AND
//         id = (SELECT id FROM users WHERE email = $2 AND passwordhash = $3)
// values: ['active', 'email', 'passwordhash']
```

## Support for limit, offset and pagination

```javascript
const actualLimit = 10
const maxLimit = 50
const offset = 20

const result = await client.query(sql`
  SELECT * FROM users ${sql.limit(actualLimit, maxLimit)} ${sql.offset(offset)}
`)

// sql: SELECT * FROM users LIMIT 10 OFFSET 20
// values: []
```

`maxLimit` is optional, but it should be set with a non user defined number to ensure a user can't select an infinite number of rows.

Because of pagination is a common use case there is also a pagination shorthand:

```javascript
const page = 5
const pageSize = 10

const result = await client.query(sql`
  SELECT * FROM users ${sql.pagination(page, pageSize)}
`)

// sql: SELECT * FROM users LIMIT 10 OFFSET 50
// values: []
```

# Extend with own fragment methods

It's possible to define own fragment methods by adding them to the `sql` tag:

```javascript
const bcrypt = require('bcrypt')

sql.passwordhash = (password, saltRounds = 10) => parameterPosition => ({
  sql: `$${++parameterPosition}`,
  values: [bcrypt.hashSync(password, saltRounds)]
})

const user = { email: 'email' }
const password = 'password'

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})
`)

// sql: INSERT INTO users (email, passwordhash) VALUES ($1, $2)
// values: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
```

It's also possible to reuse existing fragments methods to define own ones:

```javascript
const bcrypt = require('bcrypt')

sql.passwordhash = (password, saltRounds = 10) => sql.values([bcrypt.hashSync(password, saltRounds)])

const user = { email: 'email' }
const password = 'password'

const result = await client.query(sql`
  INSERT INTO users (email, passwordhash) VALUES (${sql.values(user)}, ${sql.passwordhash(password)})
`)

// sql: INSERT INTO users (email, passwordhash) VALUES ($1, $2)
// values: ['email', '$2b$10$ODInlkbnvW90q.EGZ.1Ale3YpOqqdn0QtAotg8q/JzM5HGky6Q2j6']
```

If no parameter bindings needed, the shorthand can be used by returning directly the result object:

```javascript
sql.active = active => ({
  sql: active ? 'active = true' : '1',
  values: []
})

const active = true

const result = await client.query(sql`
  SELECT * FROM users WHERE ${sql.active(active)}
`)

// sql: SELECT * FROM users WHERE active = true
// values: []
```

Or by define a constant result object if also no values needed:

```javascript
sql.first = {
  sql: `LIMIT 1`,
  values: []
}

const result = await client.query(sql`
  SELECT * FROM users ${sql.first}
`)

// sql: SELECT * FROM users LIMIT 1
// values: []
```
