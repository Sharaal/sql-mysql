const symbol = Symbol('sql-pg')

function sql (textFragments, ...valueFragments) {
  const query = {
    sql: textFragments[0],
    values: [],
    symbol
  }
  valueFragments.forEach((valueFragment, i) => {
    if (typeof valueFragment !== 'object') {
      valueFragment = sql.value(valueFragment)
    }
    query.sql += valueFragment.sql + textFragments[i + 1]
    query.values = query.values.concat(valueFragment.values)
  })
  return query
}

function escapeKey (key) {
  return `\`${key.replace(/`/g, '``')}\``
}

sql.keys = keys => {
  if (!Array.isArray(keys)) {
    keys = Object.keys(keys)
  }
  return {
    sql: keys.map(escapeKey).join(', '),
    values: []
  }
}

sql.key = key => sql.keys([key])

sql.values = (values, { keys: keys = Object.keys(values) } = {}) => {
  if (!Array.isArray(values)) {
    values = keys.map(key => values[key])
  }
  return {
    sql: Array.apply(null, { length: values.length }).map(() => '?').join(', '),
    values
  }
}

sql.value = value => sql.values([value])

sql.valuesList = (valuesList, { keys: keys = Object.keys(valuesList[0]) } = {}) => {
  const queries = []
  for (const values of valuesList) {
    const query = sql.values(values, { keys })
    queries.push({
      sql: `(${query.sql})`,
      values: query.values
    })
  }
  return queries.reduce(
    (queryA, queryB) => ({
      sql: queryA.sql + (queryA.sql ? ', ' : '') + queryB.sql,
      values: queryA.values.concat(queryB.values)
    }),
    { sql: '', values: [] }
  )
}

function pairs (pairs, separator) {
  const queries = []
  for (const key of Object.keys(pairs)) {
    const value = pairs[key]
    queries.push({
      sql: `${escapeKey(key)} = ?`,
      values: [value]
    })
  }
  return queries.reduce(
    (queryA, queryB) => ({
      sql: queryA.sql + (queryA.sql ? separator : '') + queryB.sql,
      values: queryA.values.concat(queryB.values)
    }),
    { sql: '', values: [] }
  )
}

sql.assignments = assignments => pairs(assignments, ', ')

sql.conditions = conditions => pairs(conditions, ' AND ')

function positivNumber (number, fallback) {
  number = parseInt(number, 10)
  if (number > 0) {
    return number
  }
  return fallback
}

sql.defaultFallbackLimit = 10

sql.defaultMaxLimit = 100

sql.limit = (limit, { fallbackLimit: fallbackLimit = sql.defaultFallbackLimit, maxLimit: maxLimit = sql.defaultMaxLimit } = {}) => ({
  sql: `LIMIT ${Math.min(positivNumber(limit, fallbackLimit), maxLimit)}`,
  values: []
})

sql.offset = offset => ({
  sql: `OFFSET ${positivNumber(offset, 0)}`,
  values: []
})

sql.defaultPageSize = 10

sql.pagination = (page, { pageSize: pageSize = sql.defaultPageSize } = {}) => ({
  sql: `${sql.limit(pageSize).sql} ${sql.offset(page * pageSize).sql}`,
  values: []
})

sql.if = (condition, truly, falsy = { sql: '', values: [] }) => (condition ? truly : falsy)

module.exports = sql
