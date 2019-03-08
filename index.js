function sql (textFragments, ...valueFragments) {
  let text = textFragments[0]
  let parameters = []
  valueFragments.forEach((valueFragment, i) => {
    if (typeof valueFragment !== 'object') {
      valueFragment = sql.value(valueFragment)
    }
    text += valueFragment.text + textFragments[i + 1]
    parameters = parameters.concat(valueFragment.parameters)
  })
  return { text, parameters }
}

function escapeKey (key) {
  return `"${key.replace(/"/g, '""')}"`
}

sql.keys = keys => {
  if (!Array.isArray(keys)) {
    keys = Object.keys(keys)
  }
  return {
    text: keys.map(escapeKey).join(', '),
    parameters: []
  }
}

sql.key = key => sql.keys([key])

sql.values = values => {
  if (!Array.isArray(values)) {
    values = Object.values(values)
  }
  return {
    text: Array.apply(null, { length: values.length }).map(() => '?').join(', '),
    parameters: values
  }
}

sql.value = value => sql.values([value])

sql.valuesList = valuesList =>
  valuesList
    .map(values => sql.values(values))
    .reduce(
      (valuesA, valuesB) => ({
        text: valuesA.text + (valuesA.text ? ', ' : '') + `(${valuesB.text})`,
        parameters: valuesA.parameters.concat(valuesB.parameters)
      }),
      { text: '', parameters: [] }
    )

sql.pairs = (pairs, separator) => {
  const texts = []
  const parameters = []
  for (const key of Object.keys(pairs)) {
    const value = pairs[key]
    texts.push(`${escapeKey(key)} = ?`)
    parameters.push(value)
  }
  return {
    text: texts.join(separator),
    parameters
  }
}

function positivNumber (number, fallback) {
  number = parseInt(number)
  if (isNaN(number) || number <= 0) {
    number = fallback
  }
  return number
}

sql.limit = (actualLimit, maxLimit = Infinity, fallback = 1) => ({
  text: `LIMIT ${Math.min(positivNumber(actualLimit, fallback), maxLimit)}`,
  parameters: []
})

sql.offset = (offset, fallback = 0) => ({
  text: `OFFSET ${positivNumber(offset, fallback)}`,
  parameters: []
})

sql.pagination = (page, pageSize) =>
  sql`${sql.limit(pageSize)} ${sql.offset(page * pageSize)}`

module.exports = sql
