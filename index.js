const childIndices = [
  [1, 2, 3, 4, 5, 6],
  [3, 4],
  [5, 6],
  [],
  [],
  [],
  [],
]

const paths = [
  [],
  ['position'],
  ['size'],
  ['position', 'x'],
  ['position', 'y'],
  ['size', 'width'],
  ['size', 'height'],
]

const indices = {
  '/': 0,
  '/position': 1,
  '/size': 2,
  '/position.x': 3,
  '/position.y': 4,
  '/size.width': 5,
  '/size.height': 6,
}

const parentIndices = {
  '/position': 0,
  '/size': 0,
  '/position.x': 1,
  '/position.y': 1,
  '/size.width': 2,
  '/size.height': 2,
}

const crdts = {}
const documents = {}

const shouldReplace = ([seq, agentId], [seq2, agentId2]) =>
  seq2 > seq || (seq2 === seq && agentId2 > agentId)

const parentVersionMatches = (crdt, parentPathIndex, parentVersion) => {
  const field = crdt[parentPathIndex]

  return (
    field !== undefined &&
    field[0] === parentVersion[0] &&
    field[1] === parentVersion[1]
  )
}

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))

const setValueAtPath = (obj, path, value) => {
  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]]
  }
  current[path[path.length - 1]] = value
}

const removeChildVersions = (crdt, pathIndex) => {
  const indices = childIndices[pathIndex]
  for (let i = 0; i < childIndices.length; i++) {
    const childIndex = indices[i]
    delete crdt[childIndex]
  }
}

const applyOp = (op) => {
  const {
    key,
    parentVersion,
    parentPathIndex,
    version,
    pathIndex,
    value,
  } = op

  const crdt = crdts[key]

  if (!crdt) {
    if (pathIndex !== 0) {
      return false
    }

    if (parentVersion !== undefined || parentPathIndex !== undefined) {
      return false
    }

    crdts[key] = {
      [pathIndex]: deepCopy(version),
    }

    documents[key] = deepCopy(value)

    return true
  } else {
    const document = documents[key]

    if (crdt[pathIndex] === undefined || shouldReplace(crdt[pathIndex], version)) {
      if (pathIndex === 0) {
        crdts[key] = {
          [pathIndex]: deepCopy(version),
        }
    
        documents[key] = deepCopy(value)

        return true
      }

      if (!parentVersionMatches(crdt, parentPathIndex, parentVersion)) {
        return false
      }

      crdts[key][pathIndex] = deepCopy(version)
      removeChildVersions(crdt, pathIndex)
      setValueAtPath(document, paths[pathIndex], deepCopy(value))
      return true
    }

    return false
  }
}

const createOp = (key, path, version, value) => {
  const pathIndex = indices[path]

  if (path === '/') {
    return {
      key,
      version,
      pathIndex,
      value,
    }
  }

  const parentPathIndex = parentIndices[path]
  const parentVersion = crdts[key][parentPathIndex]

  return {
    key,
    parentVersion,
    parentPathIndex,
    version,
    pathIndex,
    value,
  }
}

const op = createOp(
  '123abc',
  '/',
  [0, 'james'],
  {
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
  },
)

applyOp(op)

console.log('_OP_', op)
console.log('_CRDTS_', crdts)
console.log('_DOCUMENTS_', documents)

const op2 = createOp(
  '123abc',
  '/position',
  [1, 'james'],
  { x: 10, y: 10 },
)

applyOp(op2)

console.log('_OP2_', op2)
console.log('_CRDTS_', crdts)
console.log('_DOCUMENTS_', documents)

const op3 = createOp(
  '123abc',
  '/position.x',
  [2, 'james'],
  50,
)

applyOp(op3)

console.log('_OP3_', op3)
console.log('_CRDTS_', crdts)
console.log('_DOCUMENTS_', documents)

const op4 = createOp(
  '123abc',
  '/size',
  [3, 'james'],
  {
    width: 200,
    height: 50,
  },
)

applyOp(op4)

console.log('_OP4_', op4)
console.log('_CRDTS_', crdts)
console.log('_DOCUMENTS_', documents)
