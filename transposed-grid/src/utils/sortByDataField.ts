import { Data } from '../models/data';
import { SortOrder } from '../models/sorting';

export type SortFunction = (p1: any, p2: any) => number

export const sortByDataField = (data: Data[], lambda: (item: Data) => any, orderBy: SortOrder = SortOrder.Asc): Data[] => {
  if (!data || data.length === 0) {
    return data
  }

  let firstProperty = undefined
  let idx = 0

  do {
    firstProperty = lambda(data[idx])
    idx++
  } while (idx < data.length && (firstProperty === undefined || firstProperty === null))

  let sortFunction: SortFunction | undefined = undefined

  switch (typeof(firstProperty)) {
    case "boolean":
      sortFunction = (p1: any, p2: any) => {
        if (p1 && p2) {
          return 0
        }

        if (p1) {
          return 1
        }

        return -1
      }
      break
    case "string":
      sortFunction = (p1: string, p2: string) => p1.localeCompare(p2)
      break

    case "number":
    case "bigint":
      sortFunction = (p1: any, p2: any) => {
        if (p1 === p2) {
          return 0
        }

        if (p1 < p2) {
          return -1
        }

        return 1
      }
      break

    case "function":
    case "symbol":
    case "object":
    case "undefined":
    default:
      return data
  }

  const sortedData = [
    ...data
  ].sort((p1, p2) => sortFunction!(lambda(p1), lambda(p2)))

  if (orderBy === SortOrder.Desc) {
    sortedData.reverse()
  }

  return sortedData
}
