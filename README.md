# monkeypatcher
> The object monkey patcher to make your life easier


[![npm](https://img.shields.io/npm/v/monkeypatcher.svg?style=flat-square)](https://www.npmjs.com/package/monkeypatcher)
[![npm](https://img.shields.io/npm/dt/monkeypatcher.svg?style=flat-square)](https://www.npmjs.com/package/monkeypatcher)
[![npm](https://img.shields.io/npm/l/monkeypatcher.svg?style=flat-square)](https://github.com/chriscinelli/monkeypatcher/blob/master/license)

- [Highlights](#highlights)
- [Installation](#installation)
- [Usage](#usage)
- [Error correction level](#error-correction-level)
- [QR Code capacity](#qr-code-capacity)
- [Encoding Modes](#encoding-modes)
- [Multibyte characters](#multibyte-characters)
- [API](#api)
- [GS1 QR Codes](#gs1)
- [Credits](#credits)
- [License](#license)

## Highlights
- Quickly patch all methods of an object

## Installation
Inside your project folder run:

```shell
npm install --save monkeypatcher
```
 or 
```shell
yarn add monkeypatcher
```

## Usage
### Simple example
```javascript
const monkeypatcher = require('monkeypatcher');

const fs = require('fs');

// Patch rall methods of fs
monkeypatcher(fs, "*", {
  fn(name) {
    console.log.apply(console, arguments);
  },
  debug: true,
  getCallers: 'all',
});

// Use the patched version
fs.readFileSync('data.txt');

```


### Regular expression for methods and use of unpatch
```javascript
const monkeypatcher = require('monkeypatcher');

const fs = require('fs');

// Patch readFile and readFileSync
const unpatch = monkeypatcher(fs, /readFile/, {
  fn(name) {
    console.log.apply(console, arguments);
  },
  debug: true,
  getCallers: 'all',
});

// Use the patched version
const data = fs.readFileSync('data.txt');
unpatch();

```

```
Usage: qrcode [options] <input string>

QR Code options:
  -v, --version  QR Code symbol version (1 - 40)
  -e, --error    Error correction level            [choices: "L", "M", "Q", "H"]
  -m, --mask     Mask pattern (0 - 7)

Renderer options:
  -t, --type        Output type                  [choices: "png", "svg", "utf8"]
  -w, --width       Image width (px)
  -s, --scale       Scale factor
  -q, --qzone       Quiet zone size
  -l, --lightcolor  Light RGBA hex color
  -d, --darkcolor   Dark RGBA hex color

Options:
  -o, --output  Output file
  -h, --help    Show help                                              [boolean]

Examples:
  qrcode "some text"                    Draw in terminal window
  qrcode -o out.png "some text"         Save as png image
  qrcode -d F00 -o out.png "some text"  Use red as foreground color
```
If not specified, output type is guessed from file extension.<br>
Recognized extensions are `png`, `svg` and `txt`.

### Browser
`node-qrcode` can be used in browser through module bundlers like [Browserify](https://github.com/substack/node-browserify) and [Webpack](https://github.com/webpack/webpack) or by including the precompiled bundle present in `build/` folder.

#### Module bundlers
```html
<!-- index.html -->
<html>
  <body>
    <canvas id="canvas"></canvas>
    <script src="bundle.js"></script>
  </body>
</html>
```

```javascript
// index.js -> bundle.js
var QRCode = require('qrcode')
var canvas = document.getElementById('canvas')

QRCode.toCanvas(canvas, 'sample text', function (error) {
  if (error) console.error(error)
  console.log('success!');
})
```

#### Precompiled bundle
```html
<canvas id="canvas"></canvas>

<script src="/build/qrcode.min.js"></script>
<script>
  QRCode.toCanvas(document.getElementById('canvas'), 'sample text', function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
</script>
```

If you install through `npm`, precompiled files will be available in `node_modules/qrcode/build/` folder.<br>

### NodeJS
Simply require the module `qrcode`

```javascript
var QRCode = require('qrcode')

QRCode.toDataURL('I am a pony!', function (err, url) {
  console.log(url)
})
```

### ES6/ES7
Promises and Async/Await can be used in place of callback function.

```javascript
import QRCode from 'qrcode'

// With promises
QRCode.toDataURL('I am a pony!')
  .then(url => {
    console.log(url)
  })
  .catch(err => {
    console.error(err)
  })

// With async/await
const generateQR = async text => {
  try {
    console.log(await QRCode.toDataURL(text))
  } catch (err) {
    console.error(err)
  }
}
```

## Error correction level
Error correction capability allows to successfully scan a QR Code even if the symbol is dirty or damaged.
Four levels are available to choose according to the operating environment.

Higher levels offer a better error resistance but reduce the symbol's capacity.<br>
If the chances that the QR Code symbol may be corrupted are low (for example if it is showed through a monitor)
is possible to safely use a low error level such as `Low` or `Medium`.

Possible levels are shown below:

| Level            | Error resistance |
|------------------|:----------------:|
| **L** (Low)      | **~7%**          |
| **M** (Medium)   | **~15%**         |
| **Q** (Quartile) | **~25%**         |
| **H** (High)     | **~30%**         |

The percentage indicates the maximum amount of damaged surface after which the symbol becomes unreadable.

Error level can be set through `options.errorCorrectionLevel` property.<br>
If not specified, the default value is `M`.

```javascript
QRCode.toDataURL('some text', { errorCorrectionLevel: 'H' }, function (err, url) {
  console.log(url)
})
```

## QR Code capacity
Capacity depends on symbol version and error correction level. Also encoding modes may influence the amount of storable data.

The QR Code versions range from version **1** to version **40**.<br>
Each version has a different number of modules (black and white dots), which define the symbol's size.
For version 1 they are `21x21`, for version 2 `25x25` e so on.
Higher is the version, more are the storable data, and of course bigger will be the QR Code symbol.

The table below shows the maximum number of storable characters in each encoding mode and for each error correction level.

| Mode         | L    | M    | Q    | H    |
|--------------|------|------|------|------|
| Numeric      | 7089 | 5596 | 3993 | 3057 |
| Alphanumeric | 4296 | 3391 | 2420 | 1852 |
| Byte         | 2953 | 2331 | 1663 | 1273 |
| Kanji        | 1817 | 1435 | 1024 | 784  |

**Note:** Maximum characters number can be different when using [Mixed modes](#mixed-modes).

QR Code version can be set through `options.version` property.<br>
If no version is specified, the more suitable value will be used. Unless a specific version is required, this option is not needed.

```javascript
QRCode.toDataURL('some text', { version: 2 }, function (err, url) {
  console.log(url)
})
```

## Encoding modes
Modes can be used to encode a string in a more efficient way.<br>
A mode may be more suitable than others depending on the string content.
A list of supported modes are shown in the table below:

| Mode         | Characters                                                | Compression                               |
|--------------|-----------------------------------------------------------|-------------------------------------------|
| Numeric      | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9                              | 3 characters are represented by 10 bits   |
| Alphanumeric | 0–9, A–Z (upper-case only), space, $, %, *, +, -, ., /, : | 2 characters are represented by 11 bits   |
| Kanji        | Characters from the Shift JIS system based on JIS X 0208  | 2 kanji are represented by 13 bits        |
| Byte         | Characters from the ISO/IEC 8859-1 character set          | Each characters are represented by 8 bits |

Choose the right mode may be tricky if the input text is unknown.<br>
In these cases **Byte** mode is the best choice since all characters can be encoded with it. (See [Multibyte characters](#multibyte-characters))<br>
However, if the QR Code reader supports mixed modes, using [Auto mode](#auto-mode) may produce better results.

### Mixed modes
Mixed modes are also possible. A QR code can be generated from a series of segments having different encoding modes to optimize the data compression.<br>
However, switching from a mode to another has a cost which may lead to a worst result if it's not taken into account.
See [Manual mode](#manual-mode) for an example of how to specify segments with different encoding modes.

### Auto mode
By **default**, automatic mode selection is used.<br>
The input string is automatically splitted in various segments optimized to produce the shortest possible bitstream using mixed modes.<br>
This is the preferred way to generate the QR Code.

For example, the string **ABCDE12345678?A1A** will be splitted in 3 segments with the following modes:

| Segment  | Mode         |
|----------|--------------|
| ABCDE    | Alphanumeric |
| 12345678 | Numeric      |
| ?A1A     | Byte         |

Any other combinations of segments and modes will result in a longer bitstream.<br>
If you need to keep the QR Code size small, this mode will produce the best results.

### Manual mode
If auto mode doesn't work for you or you have specific needs, is also possible to manually specify each segment with the relative mode.
In this way no segment optimizations will be applied under the hood.<br>
Segments list can be passed as an array of object:

```javascript
  var QRCode = require('qrcode')

  var segs = [
    { data: 'ABCDEFG', mode: 'alphanumeric' },
    { data: '0123456', mode: 'numeric' }
  ]

  QRCode.toDataURL(segs, function (err, url) {
    console.log(url)
  })
```

### Kanji mode
With kanji mode is possible to encode characters from the Shift JIS system in an optimized way.<br>
Unfortunately, there isn't a way to calculate a Shifted JIS values from, for example, a character encoded in UTF-8, for this reason a conversion table from the input characters to the SJIS values is needed.<br>
This table is not included by default in the bundle to keep the size as small as possible.

If your application requires kanji support, you will need to pass a function that will take care of converting the input characters to appropriate values.

An helper method is provided by the lib through an optional file that you can include as shown in the example below.

**Note:** Support for Kanji mode is only needed if you want to benefit of the data compression, otherwise is still possible to encode kanji using Byte mode (See [Multibyte characters](#multibyte-characters)).

```javascript
  var QRCode = require('qrcode')
  var toSJIS = require('qrcode/helper/to-sjis')

  QRCode.toDataURL(kanjiString, { toSJISFunc: toSJIS }, function (err, url) {
    console.log(url)
  })
```

With precompiled bundle:

```html
<canvas id="canvas"></canvas>

<script src="/build/qrcode.min.js"></script>
<script src="/build/qrcode.tosjis.min.js"></script>
<script>
  QRCode.toCanvas(document.getElementById('canvas'),
    'sample text', { toSJISFunc: QRCode.toSJIS }, function (error) {
    if (error) console.error(error)
    console.log('success!')
  })
</script>
```

## Multibyte characters
Support for multibyte characters isn't present in the initial QR Code standard, but is possible to encode UTF-8 characters in Byte mode.

QR Codes provide a way to specify a different type of character set through ECI (Extended Channel Interpretation), but it's not fully implemented in this lib yet.

Most QR Code readers, however, are able to recognize multibyte characters even without ECI.

Note that a single Kanji/Kana or Emoji can take up to 4 bytes.

## API
Browser:
- [create()](#createtext-options)
- [toCanvas()](#tocanvascanvaselement-text-options-cberror)
- [toDataURL()](#todataurltext-options-cberror-url)
- [toString()](#tostringtext-options-cberror-string)

Server:
- [create()](#createtext-options)
- [toCanvas()](#tocanvascanvas-text-options-cberror)
- [toDataURL()](todataurltext-options-cberror-url-1)
- [toString()](#tostringtext-options-cberror-string-1)
- [toFile()](#tofilepath-text-options-cberror)
- [toFileStream()](#tofilestreamstream-text-options)

### Browser API
#### `create(text, [options])`
Creates QR Code symbol and returns a qrcode object.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [QR Code options](#qr-code-options).

##### `returns`
Type: `Object`

```javascript
// QRCode object
{
  modules,              // Bitmatrix class with modules data
  version,              // Calculated QR Code version
  errorCorrectionLevel, // Error Correction Level
  maskPattern,          // Calculated Mask pattern
  segments              // Generated segments
}
```

<br>

#### `toCanvas(canvasElement, text, [options], [cb(error)])`
#### `toCanvas(text, [options], [cb(error, canvas)])`
Draws qr code symbol to canvas.<br>
If `canvasElement` is omitted a new canvas is returned.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [Options](#options).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toCanvas('text', { errorCorrectionLevel: 'H' }, function (err, canvas) {
  if (err) throw err

  var container = document.getElementById('container')
  container.appendChild(canvas)
})
```

<br>

#### `toDataURL(text, [options], [cb(error, url)])`
#### `toDataURL(canvasElement, text, [options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.<br>
If provided, `canvasElement` will be used as canvas to generate the data URI.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `image/png`

  Data URI format.<br>
  Possible values are: `image/png`, `image/jpeg`, `image/webp`.<br>
  **Note: `image/webp` only works in Chrome browser.**

- ###### `rendererOpts.quality`
  Type: `Number`<br>
  Default: `0.92`

  A Number between `0` and `1` indicating image quality if the requested type is `image/jpeg` or `image/webp`.

See [Options](#options) for other settings.

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  rendererOpts: {
    quality: 0.3
  }
}

QRCode.toDataURL('text', opts, function (err, url) {
  if (err) throw err

  var img = document.getElementById('image')
  img.src = url
})
```
<br>

#### `toString(text, [options], [cb(error, string)])`

Returns a string representation of the QR Code.<br>
Currently only works for SVG.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `svg`

  Output format.<br>
  Possible values are: `svg`.

See [Options](#options) for other settings.

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toString('http://www.google.com', function (err, string) {
  if (err) throw err
  console.log(string)
})
```

<br>


### Server API
#### `create(text, [options])`
See [create](#createtext-options).

<br>

#### `toCanvas(canvas, text, [options], [cb(error)])`
Draws qr code symbol to [node canvas](https://github.com/Automattic/node-canvas).

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [Options](#options).

##### `cb`
Type: `Function`

Callback function called on finish.

<br>

#### `toDataURL(text, [options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.<br>
Only works with `image/png` type for now.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [Options](#options) for other settings.

##### `cb`
Type: `Function`

Callback function called on finish.

<br>

#### `toString(text, [options], [cb(error, string)])`
Returns a string representation of the QR Code.<br>
If choosen output format is `svg` it will returns a string containing xml code.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `utf8`

  Output format.<br>
  Possible values are: `utf8`, `svg`, `terminal`.

See [Options](#options) for other settings.

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toString('http://www.google.com', function (err, string) {
  if (err) throw err
  console.log(string)
})
```

<br>

#### `toFile(path, text, [options], [cb(error)])`
Saves QR Code to image file.<br>
If `options.type` is not specified, the format will be guessed from file extension.<br>
Recognized extensions are `png`, `svg`, `txt`.

##### `path`
Type: `String`

Path where to save the file.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
- ###### `type`
  Type: `String`<br>
  Default: `png`

  Output format.<br>
  Possible values are: `png`, `svg`, `utf8`.

- ###### `rendererOpts.deflateLevel` **(png only)**
  Type: `Number`<br>
  Default: `9`

  Compression level for deflate.

- ###### `rendererOpts.deflateStrategy` **(png only)**
  Type: `Number`<br>
  Default: `3`

  Compression strategy for deflate.

See [Options](#options) for other settings.

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toFile('path/to/filename.png', 'Some text', {
  color: {
    dark: '#00F',  // Blue dots
    light: '#0000' // Transparent background
  }
}, function (err) {
  if (err) throw err
  console.log('done')
})
```

<br>

#### `toFileStream(stream, text, [options])`
Writes QR Code image to stream. Only works with `png` format for now.

##### `stream`
Type: `stream.Writable`

Node stream.

##### `text`
Type: `String|Array`

Text to encode or a list of objects describing segments.

##### `options`
See [Options](#options).

<br>

### Options

#### QR Code options
##### `version`
  Type: `Number`<br>

  QR Code version. If not specified the more suitable value will be calculated.

##### `errorCorrectionLevel`
  Type: `String`<br>
  Default: `M`

  Error correction level.<br>
  Possible values are `low, medium, quartile, high` or `L, M, Q, H`.

##### `maskPattern`
  Type: `Number`<br>

  Mask pattern used to mask the symbol.<br>
  Possible values are `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`.<br>
  If not specified the more suitable value will be calculated.

##### `toSJISFunc`
  Type: `Function`<br>

  Helper function used internally to convert a kanji to its Shift JIS value.<br>
  Provide this function if you need support for Kanji mode.

#### Renderers options
##### `margin`
  Type: `Number`<br>
  Default: `4`

  Define how much wide the quiet zone should be.

##### `scale`
  Type: `Number`<br>
  Default: `4`

  Scale factor. A value of `1` means 1px per modules (black dots).

##### `width`
  Type: `Number`<br>

  Forces a specific width for the output image.<br>
  If width is too small to contain the qr symbol, this option will be ignored.<br>
  Takes precedence over `scale`.

##### `color.dark`
Type: `String`<br>
Default: `#000000ff`

Color of dark module. Value must be in hex format (RGBA).<br>
Note: dark color should always be darker than `color.light`.

##### `color.light`
Type: `String`<br>
Default: `#ffffffff`

Color of light module. Value must be in hex format (RGBA).<br>

<br>

## GS1 QR Codes
There was a real good discussion here about them. but in short any qrcode generator will make gs1 compatible qrcodes, but what defines a gs1 qrcode is a header with metadata that describes your gs1 information.

https://github.com/soldair/node-qrcode/issues/45


## Credits
This lib is based on "QRCode for JavaScript" which Kazuhiko Arase thankfully MIT licensed.

## License
[MIT](https://github.com/soldair/node-qrcode/blob/master/license)

The word "QR Code" is registered trademark of:<br>
DENSO WAVE INCORPORATED






# Monkey Patcker 
### Monkey patching the methods of an object

Getting started
Install with npm:

npm install chokidar --save

 * 
 * obj is the object to be monkey patched
 * methods can be a RegExp, the name of the object of the list of objects to be monkey patched,
 *         a method name or an object where the key is the method name and the value is the function to use
 * options:
 *   fn:         is the function to be used with all the methods. It is executed with the same "this" the function was called.
 *               The first param is a digest with "name" of the method, the "oldMetohd" function that is being patched, and
 *               "callers" (see getCallers). The other parameters are the same
 *
 *   debug:      enables some debuggign messaging
 *   getCallers: if true return the file calling the function, if "all" return all the modules and files tat call the function.
 *   extra:      extra params to be passed to the function in the digest
 *
 *   Return:     unpatcher function that when it is called unpatch the object (it does not )





## Why

- Promise interface.
- [Strips the final newline](#stripfinalnewline) from the output so you don't have to do `stdout.trim()`.
- Supports [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) binaries cross-platform.
- [Improved Windows support.](https://github.com/IndigoUnited/node-cross-spawn#why)
- Higher max buffer. 10 MB instead of 200 KB.
- [Executes locally installed binaries by name.](#preferlocal)
- [Cleans up spawned processes when the parent process dies.](#cleanup)


## Install

```
$ npm install execa
```

<a href="https://www.patreon.com/sindresorhus">
	<img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>


## Usage

```js
const execa = require('execa');

(async () => {
	const {stdout} = await execa('echo', ['unicorns']);
	console.log(stdout);
	//=> 'unicorns'
})();
```

Additional examples:

```js
const execa = require('execa');

(async () => {
	// Pipe the child process stdout to the current stdout
	execa('echo', ['unicorns']).stdout.pipe(process.stdout);


	// Run a shell command
	const {stdout} = await execa.shell('echo unicorns');
	//=> 'unicorns'


	// Catching an error
	try {
		await execa.shell('exit 3');
	} catch (error) {
		console.log(error);
		/*
		{
			message: 'Command failed: /bin/sh -c exit 3'
			killed: false,
			code: 3,
			signal: null,
			cmd: '/bin/sh -c exit 3',
			stdout: '',
			stderr: '',
			timedOut: false
		}
		*/
	}
})();

// Catching an error with a sync method
try {
	execa.shellSync('exit 3');
} catch (error) {
	console.log(error);
	/*
	{
		message: 'Command failed: /bin/sh -c exit 3'
		code: 3,
		signal: null,
		cmd: '/bin/sh -c exit 3',
		stdout: '',
		stderr: '',
		timedOut: false
	}
	*/
}
```


## API

### execa(file, [arguments], [options])

Execute a file.

Think of this as a mix of `child_process.execFile` and `child_process.spawn`.

Returns a [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess), which is enhanced to also be a `Promise` for a result `Object` with `stdout` and `stderr` properties.

### execa.stdout(file, [arguments], [options])

Same as `execa()`, but returns only `stdout`.

### execa.stderr(file, [arguments], [options])

Same as `execa()`, but returns only `stderr`.

### execa.shell(command, [options])

Execute a command through the system shell. Prefer `execa()` whenever possible, as it's both faster and safer.

Returns a [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess).

The `child_process` instance is enhanced to also be promise for a result object with `stdout` and `stderr` properties.

### execa.sync(file, [arguments], [options])

Execute a file synchronously.

Returns the same result object as [`child_process.spawnSync`](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options).

This method throws an `Error` if the command fails.

### execa.shellSync(file, [options])

Execute a command synchronously through the system shell.

Returns the same result object as [`child_process.spawnSync`](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options).

### options

Type: `Object`

#### cwd

Type: `string`<br>
Default: `process.cwd()`

Current working directory of the child process.

#### env

Type: `Object`<br>
Default: `process.env`

Environment key-value pairs. Extends automatically from `process.env`. Set `extendEnv` to `false` if you don't want this.

#### extendEnv

Type: `boolean`<br>
Default: `true`

Set to `false` if you don't want to extend the environment variables when providing the `env` property.

#### argv0

Type: `string`

Explicitly set the value of `argv[0]` sent to the child process. This will be set to `command` or `file` if not specified.

#### stdio

Type: `string[]` `string`<br>
Default: `pipe`

Child's [stdio](https://nodejs.org/api/child_process.html#child_process_options_stdio) configuration.

#### detached

Type: `boolean`

Prepare child to run independently of its parent process. Specific behavior [depends on the platform](https://nodejs.org/api/child_process.html#child_process_options_detached).

#### uid

Type: `number`

Sets the user identity of the process.

#### gid

Type: `number`

Sets the group identity of the process.

#### shell

Type: `boolean` `string`<br>
Default: `false`

If `true`, runs `command` inside of a shell. Uses `/bin/sh` on UNIX and `cmd.exe` on Windows. A different shell can be specified as a string. The shell should understand the `-c` switch on UNIX or `/d /s /c` on Windows.

#### stripFinalNewline

Type: `boolean`<br>
Default: `true`

Strip the final [newline character](https://en.wikipedia.org/wiki/Newline) from the output.

#### preferLocal

Type: `boolean`<br>
Default: `true`

Prefer locally installed binaries when looking for a binary to execute.<br>
If you `$ npm install foo`, you can then `execa('foo')`.

#### localDir

Type: `string`<br>
Default: `process.cwd()`

Preferred path to find locally installed binaries in (use with `preferLocal`).

#### input

Type: `string` `Buffer` `stream.Readable`

Write some input to the `stdin` of your binary.<br>
Streams are not allowed when using the synchronous methods.

#### reject

Type: `boolean`<br>
Default: `true`

Setting this to `false` resolves the promise with the error instead of rejecting it.

#### cleanup

Type: `boolean`<br>
Default: `true`

Keep track of the spawned process and `kill` it when the parent process exits.

#### encoding

Type: `string` `null`<br>
Default: `utf8`

Specify the character encoding used to decode the `stdout` and `stderr` output. If set to `null`, then `stdout` and `stderr` will be a `Buffer` instead of a string.

#### timeout

Type: `number`<br>
Default: `0`

If timeout is greater than `0`, the parent will send the signal identified by the `killSignal` property (the default is `SIGTERM`) if the child runs longer than timeout milliseconds.

#### buffer

Type: `boolean`<br>
Default: `true`

Buffer the output from the spawned process. When buffering is disabled you must consume the output of the `stdout` and `stderr` streams because the promise will not be resolved/rejected until they have completed.

#### maxBuffer

Type: `number`<br>
Default: `10000000` (10MB)

Largest amount of data in bytes allowed on `stdout` or `stderr`.

#### killSignal

Type: `string` `number`<br>
Default: `SIGTERM`

Signal value to be used when the spawned process will be killed.

#### stdin

Type: `string` `number` `Stream` `undefined` `null`<br>
Default: `pipe`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

#### stdout

Type: `string` `number` `Stream` `undefined` `null`<br>
Default: `pipe`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

#### stderr

Type: `string` `number` `Stream` `undefined` `null`<br>
Default: `pipe`

Same options as [`stdio`](https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio).

#### windowsVerbatimArguments

Type: `boolean`<br>
Default: `false`

If `true`, no quoting or escaping of arguments is done on Windows. Ignored on other platforms. This is set to `true` automatically when the `shell` option is `true`.


## Tips

### Save and pipe output from a child process

Let's say you want to show the output of a child process in real-time while also saving it to a variable.

```js
const execa = require('execa');
const getStream = require('get-stream');

const stream = execa('echo', ['foo']).stdout;

stream.pipe(process.stdout);

getStream(stream).then(value => {
	console.log('child output:', value);
});
```


## License

MIT © [Chris Cinelli](https://github.com/chriscinelli)






# What is in the package

- Execution with Babel (env preset) in [.babelrc](./.babelrc). Only compile what is not available. Support for (`import`/`export`).
- Bundling with [rollup](https://rollupjs.org/) in one distribution file (with sourcemaps).
- Building for node 4 with (env preset) in [.babelrc-build](./.babelrc-build) in `/dist`.
- Linting with ESLint (setup your lint in [.eslintrc.js](./.eslintrc.js) - currently set with ebay template).
- Test with [JEST](https://facebook.github.io/jest/docs/en/getting-started.html)
  - Test are local in `.spec.js` files.
  - Coverage test enforced (currently 50%) but you can change it in the [package.json](./package.json).
- Precommit hook runs tests and linting (with `--fix` so you do not waste time).
- Set up node version with nvm in `.nvmrc`.
- `npm publish` run test and build the repo.
-  Step by step debugging with `npm run debugTest` (use with [`chrome://inspect`](https://medium.com/the-node-js-collection/debugging-node-js-with-google-chrome-4965b5f910f4)).
-  Watching tests with `watch:test` (use it while you develop!)
-  Coverage with `npm run cover` and HTML report in the browser with `npm run coverHTML`

# How to use it

- Clone this repo
- `npm install -g yarn`
- `yarn`
- `npm run watch:test` while you develop!
- Modify the file in [./lib](./lib) as you like
