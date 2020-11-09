# if-webpack-loader
Conditional compilation for webpack. Inspired by [ifdef-loader](https://github.com/nippur72/ifdef-loader).

## Example & Usage
src/index.js

```javascript
// #if PRODUCTION
  // #if OS === 'windows'
  win_main();
  /* #elif OS === 'macos'
  mac_main();
  */
  // #endif
// #endif
```

webpack.config.js

```javascript
module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'if-webpack-loader',
            options: {
              PRODUCTION: true,
              OS: 'macos',
            },
          },
        ],
      },
    ],
  },
};
```

dist/main.js

```javascript
mac_main();
```

## Feature
if-webpack-loader supports multi-line comments (e.g. `/* #if ... */`) as well as single-line comments (e.g. `// #if ...`).

You can comment out `#if` / `#elif` / `#else` clauses using multi-line comments to avoid lint errors.

Code with lint errors:

```javascript
// #if OS === 'android'
import { debug } from 'awesome-debugger-for-android';
// #else
import { debug } from 'ordinary-debugger';
// #endif
debug();
```

Code without lint errors:

```javascript
// #if OS === 'android'
import { debug } from 'awesome-debugger-for-android';
/* #else
import { debug } from 'ordinary-debugger';
*/
// #endif
debug();
```

## Limitation
if-webpack-loader is not aware of string literals, so comments in string literals (e.g. `"Hello, //#if world!"`) might cause build errors.

## Author
[iorate](https://github.com/iorate)

## License
[MIT License](LICENSE.txt)
