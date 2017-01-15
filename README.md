# delimited-input

*Proof-of-concept*

Reading long numbers or codes is hard without some kind of delimiter to
provide pacing or idea of the scale. This library provides support for
formatting user input as it's written.

This library is fairly early in development but it should provide some basic
support for formatting rules already.


## Example input and output

- Big number: writing `7283947` shows like this `7,283,947`
- Credit card: writing `4265827561095863` shows like this `4265 8275 6109 5863`
- Product code: writing `abj39lv2jvk3` show like this `abj3-9lv2-jvk3`

Test at the [project homepage](https://teijo.github.io/delimited-input/).

## Example usage

Auto-format user input as it is modified:

```html
<input id="numeric_input" type="text" value="7,283,947"/>
```

```javascript
var thousandsDelimiter = DelimitedInput(",", 3);
document
  .getElementById("numeric_input")
  .addEventListener("keydown", thousandsDelimiter);
```

### Node

```javascript
var DelimitedInput = require("delimited-input");
```

### RequireJS

```javascript
requirejs(["delimited-input"], function(DelimitedInput) {
  /*...*/
});
```

## Installing

```
npm install --save delimited-input
```


## Development

```
npm install
npm start
```

Open `test.html` in the browser (e.g. `file://...` from file system) for
testing. Code changes reload the test page automatically.
