# xtabs

A cross tabulation library simulating R's API.

## Installation

```bash
$ npm install xtabs
```

## Examples

### Cross tabulation

```js
var xtabs = require("xtabs");

var data = {
  // null represents absence of data, like NA in R.
  department: ["RD", "RD", "HR", "GA", null, "GA", "RD"],
  gender: ["M", "F", null, "M", "F", "M", "M"]
};

// Make a cross tabulation by department and gender.
var t = xtabs.table(data, "department", "gender");
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

### Adding margins

```js
var sum = function(a) {
  return a.reduce(function(x, y) { return x + y });
};

var prod = function(a) {
  return a.reduce(function(x, y) { return x * y });
};

var t = xtabs.table(data, "department", "gender");

// This adds a row 'Sum'.
var t_ = xtabs.addMargins(t, 0, { n: "Sum", f: sum });
console.log(t_.get("Sum", "M")); // 4
console.log(t_.get("Sum").array); // [4, 1]

// This adds a column 'Sum'.
var t_ = xtabs.addMargins(t, 1, { n: "Sum", f: sum });
console.log(t_.get("RD", "Sum")); // 3
console.log(t_.get(undefined, "Sum").array); // [3, 0, 2]

// This adds both a row 'Sum' and a column 'Sum'.
var t_ = xtabs.addMargins(t, [0, 1], { n: "Sum", f: sum });
console.log(t_.get("Sum", "Sum")); // 5

// This adds 'Sum' and 'Prod' rows and a 'Sum' column.
var t_ = xtabs.addMargins(t, [0, 1],
  [[{ n: "Sum", f: sum }, { n: "Prod", f: prod }], [{ n: "Sum", f: sum }]]);
```

### Proportions of a table

```js
var t = xtabs.table(data, "department", "gender");

// Proportions calculated in relation to all data.
var t_ = xtabs.prop(t);
console.log(t_.get("RD").array); // [0.4, 0.2]

// Proportions calculated in relation to rows.
var t_ = xtabs.prop(t, 0);
console.log(t_.get("RD").array); // [2/3, 1/3]

// Proportions calculated in relation to columns.
var t_ = xtabs.prop(t, 1);
console.log(t_.get(undefined, "M").array); // [0.5, 0, 0.5]
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

### xtabs.addMargins(table, margins, fun)

Add margins to a table. For a two-dimensional table, that means adding rows and columns, margin 0 represents rows, margin 1 represents columns. `fun` is the function to apply. E.g:

```
Given the following table:

                gender
department    M        F
   RD         2        1
   HR         0        0
   GA         2        0

After adding a margin 0 using a sum function, you will get:

                gender
department    M        F
   RD         2        1
   HR         0        0
   GA         2        0
   Sum        4        1

If you add a margin 1 instead, you will get:

                gender
department    M        F      Sum
   RD         2        1       3
   HR         0        0       0
   GA         2        0       2
```

You can add multiple margins at once, or apply multiple functions at once, or both. If you want to add multiple margins at once, you pass in an array of margins to be added in order, instead of a single margin. If you want to apply multiple functions, you can provide a list of function objects (See [Adding margins](#adding-margins)) per margin. Functions are applied in the same order the margins are provided.

### xtabs.prop(table, margin)

Return a new table with proportions according to `margin`. If `margin` is undefined or null, then proportions are calculated in relation of the whole table. See [Proportions of a table](#proportions-of-a-table) for examples of how to use it. Also refer to the following diagrams:

```
Original table:
                gender
department    M        F
   RD         2        1
   HR         0        0
   GA         2        0

Proportions in relation to rows:
                gender
department    M        F
   RD        2/3      1/3
   HR        NaN      NaN
   GA        2/2      0/2

Proportions in relation to columns:
                gender
department    M        F
   RD        2/4      1/1
   HR        0/4      0/1
   GA        2/4      0/1

Proportions in relation to whole:
                gender
department    M        F
   RD        2/5      1/5
   HR        0/5      0/5
   GA        2/5      0/5
```

## Class: xtabs.Table

This is what you get when you call [xtabs.table](#xtabstablex-variable--usenull), however, this class is not directly exposed to you.

### table.dim

The dimensions of the table. It's an array with each dimension's length.

### table.dimnames

An array containing each dimension's names, each one has a `dim` property indicating the dimension's name and a `names` property indicating each level's name in the dimension. 

### table.array

The array representing the table. This is underline data structure of the table.

### table.get([level | list of levels, ...])

Gets data out of the table. Basically, you pass in each variable's index or indices to get the data out. You can also pass in `undefined` as a special way to indicate that you want all the data of this variable. You can refer to the [Examples](#examples) section for the various ways to use this method.

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
