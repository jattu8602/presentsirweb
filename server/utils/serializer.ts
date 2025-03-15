export const serializeMongoDB = <T>(data: T): T => {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'bigint') {
    return data.toString() as unknown as T
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoDB(item)) as unknown as T
  }

  if (typeof data === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        serialized[key] = value.toISOString()
      } else if (typeof value === 'bigint') {
        serialized[key] = value.toString()
      } else if (value && typeof value === 'object') {
        serialized[key] = serializeMongoDB(value)
      } else {
        serialized[key] = value
      }
    }
    return serialized
  }

  return data
}

export const jsonResponse = (res: any, data: any) => {
  return res.json(serializeMongoDB(data))
}
