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
  department: ["RD", "RD", "HR", "GA", null, "GA", "RD"],
  gender: ["M", "F", null, "M", "F", "M", "M"]
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

// You can use list indices as well.
console.log(t.get(["RD", "GA"], "F").dim); // [2]

// List indices can also be in number form.
console.log(t.get([0, 2], 1).dim); // [2]
```

## API

### xtabs.factor(x, [useNull])

Returns a factor represented as a JavaScript array with a `levels` property. You may refer to R's factor to better understand it. If `useNull` is true, then `null` is counted as level too, this simulates R's _factor not excluding NA's_ behavior.

### xtabs.isFactor(o)

Checks if `o` is a factor.

### xtabs.asString(factor)

Converts back a factor to its string representation.

### xtabs.table(x, [[variable, ...], useNull])

Creates a cross tabulation.

If `x` is an array or factor, it is being used as the data source for the tabulation.

If `x` is an object with array/factor properties, then subsequent `variables` are provided as tabulation variables. For example:

```js
xtabs.table(employees, "department", "gender")
```

The above means that __employees__ is the data source (a table in fact) containing __department__ and __gender__ data, and you want to make a cross tabulation by _department_ and then by _gender_. The result in this particular case is a two-dimensional table, sort of like this:

```
                gender
department    M        F
   RD         2        1
   HR         0        0
   GA         2        0
```

For more about behaviors about cross tabulation, you can refer to R's `xtabs` function (Hence the name of this project).

If `useNull` is true, then `null` is counted too.

## Class: xtabs.Table

This is what you get when you call [xtabs.table](#xtabstablex-variable--usenull), however, this class is not directly exposed to you.

### table.dim

The dimensions of the table. It's an array with each dimension's length.

### table.dimnames

An array containing each dimension's names, each one has a `dim` property indicating the dimension's name and a `names` property indicating each level's name in the dimension. 

### table.get([level | list of levels, ...])

Gets data out of the table. Basically, you pass in each variable's index or indices to get the data out. You can also pass in `undefined` as a special way to indicate that you want all the data of this variable. You can refer to the [Examples](#example) section for the various ways to use this method.

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
