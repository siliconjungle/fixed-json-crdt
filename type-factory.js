export const getPrimitive = (value) => {
	if (value === null) {
		return 'null'
	}
	if (Array.isArray(value)) {
		return 'array'
	}
	switch (typeof value) {
		case 'string':
			return 'string'
    case 'number':
			return 'number'
		case 'boolean':
			return 'boolean'
		case 'object':
			return 'object'
		default:
			throw new Error(`Unsupported type: ${typeof value}`)
	}
}

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))

export const getPaths = (type, paths = [], path = []) => {
  let currentPrimitive = getPrimitive(type)

  if (currentPrimitive === 'string') {
    paths.push(deepCopy(path))
    return paths
  }

  if (currentPrimitive === 'object') {
    paths.push(deepCopy(path))

    for (const key in type) {
      const newPath = deepCopy(path)
      newPath.push(key)
      getPaths(type[key], paths, newPath)
    }

    return paths
  }

  throw new Error(`Unsupported type def: ${currentPrimitive}`)
}

export const getIndices = (paths) => {
  const indices = {}

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const pathString = `/${path.join('.')}`
    indices[pathString] = i
  }

  return indices
}

export const getParentIndices = (indices, paths) => {
  const parentIndices = []

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const parentPathIndices = []
    for (let j = path.length - 1; j > -1; j--) {
      const parentPath = path.slice(0, j)
      const parentPathString = `/${parentPath.join('.')}`
      const parentPathIndex = indices[parentPathString]
      parentPathIndices.push(parentPathIndex)
    }
    parentIndices.push(parentPathIndices)
  }

  return parentIndices
}

export const getNestedChildIndices = (paths, parentIndices) => {
  const childIndices = []

  for (let i = 0; i < paths.length; i++) {
    childIndices.push([])
  }

  for (let i = 0; i < parentIndices.length; i++) {
    const parentIndex = parentIndices[i]
    for (let j = 0; j < parentIndex.length; j++) {
      const parent = parentIndex[j]
      childIndices[parent].push(i)
    }
  }

  return childIndices
}

export const createTypeMetadata = (type) => {
  const paths = getPaths(type)
  const indices = getIndices(paths)
  const parentIndices = getParentIndices(indices, paths)
  const childIndices = getNestedChildIndices(paths, parentIndices)

  return {
    paths,
    indices,
    parentIndices,
    childIndices,
  }
}

const shape = {
  position: {
    x: 'number',
    y: 'number',
  },
  size: {
    width: 'number',
    height: 'number',
  },
}

const player = {
  position: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
  rotation: {
    x: 'number',
    y: 'number',
    z: 'number',
  },
}

console.log('_SHAPE_META_', createTypeMetadata(shape))
console.log('_PLAYER_META_', createTypeMetadata(player))
