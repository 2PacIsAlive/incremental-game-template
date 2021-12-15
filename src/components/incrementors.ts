import { Decimal } from 'decimal.js'

export interface Incrementor {
  (decimal: Decimal): Decimal
}

export interface Incrementors {
  [incrementType: string]: Incrementor,
}

export const incrementors: Incrementors = {
  sqrt: function (decimal) {
    return Decimal.add(decimal, Decimal.sqrt(decimal))
  },
  constant: function (decimal) {
    return Decimal.add(1, decimal)
  },
  log10: function (decimal) {
    return Decimal.add(decimal, Decimal.log10(decimal))
  },
  log2: function (decimal) {
    return Decimal.add(decimal, Decimal.log2(decimal))
  },
  exponential: function (decimal) {
    return Decimal.pow(decimal, 2)
  },
}
