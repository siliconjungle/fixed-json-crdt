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

// Each change is versioned, the fields themselves aren't versioned.
// The fields just reference the uid of the change.
const op = {
  key: 'test',
  version: [0, 'james'],
  pathIndex: 0,
  value: {
    position: {
      x: 0,
      y: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
  },
}

const op2 = {
  key: 'test',
  parentPathIndex: 0,
  parentVersion: [0, 'james'],
  version: [1, 'james'],
  pathIndex: 1,
  value: {
    x: 50,
    y: 50,
  },
}

const op3 = {
  key: 'test',
  parentPathIndex: 0,
  parentVersion: [0, 'james'],
  version: [2, 'james'],
  pathIndex: 1,
  value: {
    x: 150,
    y: 75,
  },
}

const op4 = {
  key: 'test',
  version: [3, 'james'],
  pathIndex: 0,
  value: {
    position: {
      x: 125,
      y: 92,
    },
    size: {
      width: 63,
      height: 12,
    },
  },
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

console.log('_CRDTS_', crdts)
console.log('_DOCS_', documents)

applyOp(op)

console.log('_CRDTS_', crdts)
console.log('_DOCS_', documents)

applyOp(op2)

console.log('_CRDTS_', crdts)
console.log('_DOCS_', documents)

applyOp(op3)

console.log('_CRDTS_', crdts)
console.log('_DOCS_', documents)

applyOp(op4)

console.log('_CRDTS_', crdts)
console.log('_DOCS_', documents)
