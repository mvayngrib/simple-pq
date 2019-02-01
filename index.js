const noop = () => {}
const createQueue = ({ onEmpty }={ onEmpty: noop }) => {
  const tasks = []
  let running = false

  const enqueue = taskFn => new Promise((resolve, reject) => {
    tasks.push({ resolve, reject, run: taskFn })
    next()
  })

  const next = async () => {
    if (running) return
    if (!tasks.length) {
      onEmpty()
      return
    }

    running = true
    const { run, resolve, reject } = tasks.shift()
    try {
      const ret = await run()
      resolve(ret)
    } catch(err) {
      reject(err)
    } finally {
      running = false
      next()
    }
  }

  return { enqueue }
}

const createMultiQueue = ({ onEmpty }={ onEmpty: noop }) => {
  const queues = {}
  const enqueue = (queueId, taskFn) => {
    if (!queues[queueId]) {
      queues[queueId] = createQueue({
        onEmpty: () => {
          delete queues[queueId]
          onEmpty(queueId)
        }
      })
    }

    return queues[queueId].enqueue(taskFn)
  }

  return { enqueue }
}

module.exports = {
  createQueue,
  createMultiQueue
}
