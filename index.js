function sql (textFragments, ...valueFragments) {
  const query = {
    sql: textFragments[0],
    values: []
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
  return `"${key.replace(/"/g, '""')}"`
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

sql.values = values => {
  if (!Array.isArray(values)) {
    values = Object.values(values)
  }
  return {
    sql: Array.apply(null, { length: values.length }).map(() => '?').join(', '),
    values
  }
}

sql.value = value => sql.values([value])

sql.valuesList = valuesList => {
  const queries = []
  for (const values of valuesList) {
    const query = sql.values(values)
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

sql.pairs = (pairs, separator) => {
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

function positivNumber (number, fallback) {
  number = parseInt(number)
  if (isNaN(number) || number <= 0) {
    number = fallback
  }
  return number
}

sql.limit = (actualLimit, maxLimit = Infinity, fallback = 1) => ({
  sql: `LIMIT ${Math.min(positivNumber(actualLimit, fallback), maxLimit)}`,
  values: []
})

sql.offset = (offset, fallback = 0) => ({
  sql: `OFFSET ${positivNumber(offset, fallback)}`,
  values: []
})

sql.pagination = (page, pageSize) =>
  sql`${sql.limit(pageSize)} ${sql.offset(page * pageSize)}`

module.exports = sql
