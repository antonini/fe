import path from 'path'
// import fs from 'fs'

export default projectRootPath => {
  const resolveApp = relativePath => path.resolve(projectRootPath, relativePath)

  const nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .map(resolveApp)

  return {
    appRoot: projectRootPath,
    appBuild: resolveApp('build'),
    appPublic: resolveApp('public'),
    appTemplate: resolveApp('config/template.ejs'),
    appEntry: resolveApp('src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    ownNodeModules: resolveApp('node_modules'),
    nodePaths: nodePaths
  }
}
