# simple-pq

bare-bones promise queue

## Usage

```js
const { createQueue, createMultiQueue } = require('./')

const wait = millis => new Promise(resolve => setTimeout(resolve, millis))
const timeoutIn = millis => wait(millis).then(() => {
  throw new Error(`rejected after ${millis}ms`)
})

const log = (...args) => console.log(...args)

const multi = createMultiQueue({
  onEmpty: queueId => log(`${queueId} is empty`)
})

for (let i = 300; i > 0; i -= 50) {
  const millis = i
  multi.enqueue('a', () => wait(millis))
    .then(() => log(`a:${millis}`))

  multi.enqueue('b', () => timeoutIn(300 - millis))
    .catch(() => log(`b:${millis}`))
}

// something like:
//
// b:300
// b:250
// b:200
// b:150
// b:100
// a:300
// b is empty
// b:50
// a:250
// a:200
// a:150
// a:100
// a is empty
// a:50
````
