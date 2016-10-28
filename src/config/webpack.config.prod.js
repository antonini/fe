import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import findCacheDir from 'find-cache-dir'
import moduleResolve from '../utils/moduleResolve'
// import InterpolateHtmlPlugin from '../utils/InterpolateHtmlPlugin'

/*
function ensureSlash (path, needsSlash) {
  var hasSlash = path.endsWith('/')
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1)
  } else if (!hasSlash && needsSlash) {
    return path + '/'
  } else {
    return path
  }
}
*/

/*
// We use "homepage" field to infer "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
var homepagePath = require(paths.appPackageJson).homepage
var homepagePathname = homepagePath ? url.parse(homepagePath).pathname : '/'
// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
var publicPath = ensureSlash(homepagePathname, true)
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing shlash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = ensureSlash(homepagePathname, false)
// Get enrivonment variables to inject into our app.
var env = getClientEnvironment(publicUrl)
*/

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
// if (env['process.env.NODE_ENV'] !== '"production"') {
//   throw new Error('Production builds must have NODE_ENV=production.')
// }

export default paths => ({
  // Don't attempt to continue if there are any errors.
  bail: true,
  devtool: 'cheap-module-source-map',
  // In production, we only want to load the polyfills and the app code.
  entry: [
    moduleResolve('babel-polyfill'),
    moduleResolve('fe/lib/config/polyfills'),
    paths.appEntry
  ],
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: ''
    // We inferred the "public path" (such as / or /my-project) from homepage.
    // publicPath: publicPath
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
    // We use `fallback` instead of `root` because we want `node_modules` to "win"
    // if there any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    // fallback: paths.nodePaths,
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.js', '.json', '.jsx'],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      // 'react-native': 'react-native-web'
      components: path.join(paths.appSrc, 'components'),
      containers: path.join(paths.appSrc, 'containers'),
      actions: path.join(paths.appSrc, 'actions'),
      reducers: path.join(paths.appSrc, 'reducers'),
      common: path.join(paths.appSrc, 'common'),
      utils: path.join(paths.appSrc, 'utils'),
      constants: path.join(paths.appSrc, 'constants')
    }
  },

  module: {
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    // preLoaders: [
    //   {
    //     test: /\.(js|jsx)$/,
    //     loader: 'eslint',
    //     include: paths.appSrc
    //   }
    // ],
    loaders: [
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        query: {
          'presets': [
            moduleResolve('babel-preset-fe')
          ],
          'compact': true,

          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/react-scripts/
          // directory for faster rebuilds. We use findCacheDir() because of:
          // https://github.com/facebookincubator/create-react-app/issues/483
          cacheDirectory: findCacheDir({
            name: 'babel-loader'
          })
        }
      },
      // The notation here is somewhat confusing.
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader normally turns CSS into JS modules injecting <style>,
      // but unlike in development configuration, we do something different.
      // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
      // (second argument), then grabs the result CSS and puts it into a
      // separate file in our build process. This way we actually ship
      // a single CSS file in production instead of JS code injecting <style>
      // tags. If you use code splitting, however, any async bundles will still
      // use the "style" loader inside the async code so CSS from them won't be
      // in the main CSS file.
      {
        test: /\.module\.css$/,
        loader: ExtractTextPlugin.extract({notExtractLoader: 'style', loader: 'css?modules&minimize'})
      },
      {
        // test: /(?<!\.module)\.css$/,
        test (filename) {
          return /\.css$/.test(filename) && !/\.module\.css$/.test(filename)
        },
        // "?-autoprefixer" disables autoprefixer in css-loader itself:
        // https://github.com/webpack/css-loader/issues/281
        // We already have it thanks to postcss. We only pass this flag in
        // production because "css" loader only enables autoprefixer-powered
        // removal of unnecessary prefixes when Uglify plugin is enabled.
        // Webpack 1.x uses Uglify plugin as a signal to minify *all* the assets
        // including CSS. This is confusing and will be removed in Webpack 2:
        // https://github.com/webpack/webpack/issues/283
        // loader: ExtractTextPlugin.extract('style', 'css?-autoprefixer!postcss')
        loader: ExtractTextPlugin.extract({notExtractLoader: 'style', loader: 'css?minimize'})
        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
      },
      {
        test: /\.module\.styl$/,
        loader: ExtractTextPlugin.extract({notExtractLoader: 'style', loader: 'css?modules&minimize!stylus'})
      },
      {
        // test: /(?<!\.module)\.styl$/,
        test (filename) {
          return /\.styl$/.test(filename) && !/\.module\.styl$/.test(filename)
        },
        loader: ExtractTextPlugin.extract({notExtractLoader: 'style', loader: 'css?minimize!stylus'})
      },
      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json'
      },
      // "file" loader makes sure those assets end up in the `build` folder.
      // When you `import` an asset, you get its filename.
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file',
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      // "url" loader works just like "file" loader but it also embeds
      // assets smaller than specified size as data URLs to avoid requests.
      {
        test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
    ]
  },

  // We use PostCSS for autoprefixing only.
  // postcss: function () {
  //   return [
  //     autoprefixer({
  //       browsers: [
  //         '>1%',
  //         'last 4 versions',
  //         'Firefox ESR',
  //         'not ie < 9' // React doesn't support IE8 anyway
  //       ]
  //     })
  //   ]
  // },
  plugins: [
    // Makes the public URL available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In production, it will be an empty string unless you specify "homepage"
    // in `package.json`, in which case it will be the pathname of that URL.
    // new InterpolateHtmlPlugin({
    //   PUBLIC_URL: publicUrl
    // }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      title: '',
      hash: false,
      inject: false,
      template: paths.appTemplate,
      appMountId: 'root',
      // Or
      // appMountIds: ['root', 'app'],
      window: {
        ENV: 'prod'
      },
      filename: path.join(paths.appBuild, 'index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    // new webpack.DefinePlugin(env),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // Try to dedupe duplicated modules, if any:
    new webpack.optimize.DedupePlugin(),
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false,
        // remove `console.*`
        drop_console: true
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      allChunks: true
    })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolveLoader: {
    // An array of directory names to be resolved to the current directory
    modules: ['node_modules', path.resolve(moduleResolve('fe/package.json'), '..', 'node_modules')]
  }
})