# Archicheck
Archicheck is a command line tool for ensuring that high level architecture of C and C++ projects are maintained during development. It is intended to be used in conjuction with continuous integration tools like GitLab CI.

Archicheck recursively scans header files labeled with a special `// @level` tag, and checks to make sure that none of the imports are more abstract than the importer. That is to say, it enforces the inversion principle. 

# Basic Usage 
1. Install `archicheck` globally with `npm install -g archicheck`
2. Add a `// @level 3` comment somewhere in each of your header files
    - You may use any number.
    - `1` represents the **top level** of your app, the most abstract
    - larger numbers represent layers further down in the app architecture
3. Call archicheck on the directory containing your headers. `archicheck headers`
    - It will be scanned recursively looking for headers with `#include "somelibrary.h"`
    - Imports of the form `<somelibrary>` will be ignored
    - It will fail if it finds a header without a `// @level` comment
    - It will fail if it cannot locate an imported header
    - It will fail if any header attempts to import header with a lower level lower than its own

# Integration with GitLab CI
In your `.gitlab-ci.yml` file, add a new build using an image that contains node. Within node, install `archicheck` and run it on your headers directory.

```javascript
build:osx:
    stage: test
    script: 
      - npm install -g archicheck
      - archicheck headers 
```

# Advanced
No functionality currently exists for ignoring specific files or directories, automatically scanning project include paths for headers outside of the project, or ignoring files without a `// @level` comment. If interest is expressed in these features I will add them.