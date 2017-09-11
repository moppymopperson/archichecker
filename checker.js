'use strict'
const fs = require('fs')
const walk = require('walk')

/**
 * Returns a Promise for an an array of objects containing a 
 * filename and a path for each of the files in the given directory.
 * @param {string} directory
 */
function recurseDirectories(directory) {
  return new Promise((fullfill, reject) => {
    let files = []
    const walker = walk.walk(directory, { followLinks: false })
    walker.on('file', (root, stat, next) => {
      files.push({ filename: stat.name, path: root + '/' + stat.name })
      next()
    })

    walker.on('end', () => {
      fullfill(files)
    })
  })
}

/**
 * Removes strings from an array that do not end in h or hpp
 * @param {string[]} files 
 */
function filterCppFiles(files) {
  return files.filter(
    file => file.slice(-4) === '.hpp' || file.slice(-2) === '.h'
  )
}

/**
 * Returns a Promise for an array of strings that is all the filenames
 * included in a files header. Only files of the type #include "something.h" 
 * will be returned. 
 * @param {string} filepath 
 */
function getIncludes(filepath) {
  return new Promise((fulfill, reject) => {
    fs.readFile(filepath, (error, data) => {
      if (error) reject(error)
      const text = data.toString()
      let includes = []
      const regex = /#include ((<[^>]+>)|"([^"]+)")/g
      let match = regex.exec(text)
      while (match != null) {
        if (match[3]) {
          includes.push(match[3])
        }
        match = regex.exec(text)
      }
      fulfill(includes)
    })
  })
}

module.exports = {
  recurseDirectories,
  filterCppFiles,
  getIncludes
}
