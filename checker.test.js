const checker = require('./checker')

describe('checker.js', () => {
  it('Finds files in nested directories', () => {
    return checker.recurseDirectories('./testdir').then(files => {
      expect(files.length).toBe(5)
    })
  })

  it('Filters out non .h and .hpp files', () => {
    const files = checker.filterCppFiles(['test.h', 'test.hpp', 'test.herp'])
    expect(files).toEqual(['test.h', 'test.hpp'])
  })

  it('extracts all headers from a file', () => {
    const filepath = './testdir/headerA.h'
    return checker
      .getIncludes('./testdir/nesteddir/headerB.h')
      .then(includes => {
        expect(includes).toEqual(['tester.h', 'dog.h'])
      })
  })
})
