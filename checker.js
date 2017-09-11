'use strict'
const fs = require('fs')
const walk = require('walk')

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

/*******************************************************************/

/**
 * Returns a Promise for an an array of objects containing a 
 * filename and a path for each of the files in the given directory.
 * @param {string} directory
 */
function recurseDirectories(directory) {
  return new Promise((fullfill, reject) => {
    if (!fs.existsSync(directory)) {
      reject(new Error(`Directory ${directory} does not exist`))
    }
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
 * @param {object} files 
 */
function filterCppFiles(files) {
  return files.filter(
    file =>
      file.filename.slice(-4) === '.hpp' || file.filename.slice(-2) === '.h'
  )
}

/**
 * Returns a Promise for an array of strings that is all the filenames
 * included in a files header. Only files of the type #include "something.h" 
 * will be returned. 
 * @param {string} filepath 
 */
function getIncludes(filepath) {
  return new Promise((resolve, reject) => {
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
      resolve(includes)
    })
  })
}

/**
 * Returns a Promise for the level of a file.
 * The level is extracted from the first line containing a comment
 * of the format // @level 3
 * @param {string} filepath 
 */
function getFileLevel(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (error, data) => {
      if (error) reject(error)
      const text = data.toString()
      const regex = /\/\/\s*@level\s+(\d)/
      const match = regex.exec(text)
      if (!match) {
        reject(
          new Error('No // @level comment found for file at path:' + filepath)
        )
      } else {
        resolve(parseInt(match[1]))
      }
    })
  })
}

/** A composite function that builds up the following
 * data for all .h and .hpp files in the specified directory
 * and its recursive subdirectories
 * file: string
 * filepath: string
 * level: number
 * includes: string[]
 */
function buildupFileInfo(directory) {
  return recurseDirectories(directory)
    .then(files => filterCppFiles(files))
    .then(files =>
      Promise.all(
        files.map(file =>
          getFileLevel(file.path).then(level => {
            file.level = level
            return file
          })
        )
      )
    )
    .then(files =>
      Promise.all(
        files.map(file =>
          getIncludes(file.path).then(includes => {
            file.includes = includes
            return file
          })
        )
      )
    )
}

/**
 * Runs a full inspection on the contents of a directory, enumeratiring
 * over each file, checking its level, and the level of all its includes
 * @param {string} directory 
 */
function runInspection(directory) {
  return buildupFileInfo(directory).then(fileInfos => {
    for (let info of fileInfos) {
      for (let include of info.includes) {
        const includedFile = fileInfos.find(file => file.filename === include)
        if (!includedFile) {
          throw new Error(
            `File ${include} included by ${info.filename} could not be located!`
          )
        }

        if (includedFile.level < info.level) {
          throw new Error(
            `File ${info.filename} included a file from a level higher than itself, ${includedFile.filename}`
          )
        }
      }
    }
  })
}

module.exports = {
  recurseDirectories,
  filterCppFiles,
  getIncludes,
  getFileLevel,
  buildupFileInfo,
  runInspection
}
