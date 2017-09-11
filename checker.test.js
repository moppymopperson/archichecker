const checker = require('./checker')

describe('checker.js', () => {
  it('Finds files in nested directories', () => {
    return checker.recurseDirectories('./testdir').then(files => {
      expect(files.length).toBe(5)
    })
  })

  it('Throws an error for nonexistant directories', () => {
    return checker.recurseDirectories('asdfasdf').catch(error => {
      expect(error).toBeDefined()
    })
  })

  it('Filters out non .h and .hpp files', () => {
    const files = checker.filterCppFiles([
      { filename: 'test.h' },
      { filename: 'test.hpp' },
      { filename: 'test.herp' }
    ])
    expect(files).toEqual([{ filename: 'test.h' }, { filename: 'test.hpp' }])
  })

  it('extracts all headers from a file', () => {
    const filepath = './testdir/headerA.h'
    return checker
      .getIncludes('./testdir/nesteddir/headerB.h')
      .then(includes => {
        expect(includes).toEqual(['tester.h', 'dog.h'])
      })
  })

  it('extracts file level form a header', () => {
    const filepath = './testdir/nesteddir/headerB.h'
    return checker.getFileLevel(filepath).then(level => {
      expect(level).toBe(5)
    })
  })

  it('builds up file info correctly', () => {
    return checker.buildupFileInfo('./testdir').then(fileInfos => {
      expect(fileInfos).toEqual([
        {
          filename: 'headerA.h',
          path: './testdir/headerA.h',
          level: 1,
          includes: ['headerB.h']
        },
        {
          filename: 'headerB.h',
          path: './testdir/nesteddir/headerB.h',
          level: 5,
          includes: ['tester.h', 'dog.h']
        }
      ])
    })
  })

  it('detects missing files', () => {
    return
    checker.runInspection('./testdir').catch(error => {
      expect(error).toBeDefined()
    })
  })

  it('passes when everything is okay', () => {
    return expect(checker.runInspection('./testdir2')).resolves.toBe()
  })
})
