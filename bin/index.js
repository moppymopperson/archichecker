#!/usr/bin/env node
const runInspection = require('../lib/checker').runInspection

if (process.argv.length < 3) {
  console.log('You must provide a directory')
  process.exit(1)
} else if (process.argv.length > 3) {
  console.log('checker only takes one argument, the directory')
  process.exit(1)
}

const directory = process.argv[2]
runInspection(directory)
  .then(() => {
    console.log('Success! Architecture is in good shape!')
  })
  .catch(error => {
    console.log(error)
  })
