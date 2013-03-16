# xtabs

A cross tabulation library simulating R's API.

## Installation

```bash
$ npm install xtabs
```

## Example

```js
var xtabs = require("xtabs"),
    data, t;

data = {
  // null represents absence of data, like NA in R.
  department: xtabs.factor(["RD", "RD", "HR", "GA", null, "GA", "RD"]),
  gender: xtabs.factor(["M", "F", null, "M", "F", "M", "M"])
};

// Make a cross tabulation by department and gender.
t = xtabs.table(data, "department", "gender");
console.log(t.get("HR", "M")); // 0
console.log(t.get("RD", "F")); // 1
console.log(t.dim); // [3, 2]
console.log(t.dimnames);

// Use undefined to indicate that you want the whole data.
// t.get(undefined, "M") is equivalent to t[, "M"] in R.
console.log(t.get(undefined, "M").get("GA")); // 2

// You can also use number indices to retrieve data.
// t.get(0) is equivalent to t.get(0, undefined).
console.log(t.get(0).dim); // [2]
```

## API

### xtabs.factor(x, [useNull])

### xtabs.isFactor(o)

### xtabs.asString(factor)

### xtabs.table(x, [[variable, ...], useNull])

## License

(The MIT License)

Copyright (c) 2013 Seth Yuan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
