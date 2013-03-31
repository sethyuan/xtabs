//
// Factor related code.
//

var unique = function(x) {
  var set = {}, hasNull = false;
  for (var i = 0; i < x.length; i++) {
    if (x[i] === null) hasNull = true;
    else if (set[x[i]] == null) set[x[i]] = true;
  }
  return hasNull ? Object.keys(set).concat(null) : Object.keys(set);
};

var match = function(x, table, useNull) {
  // Construct map.
  var map = {};
  for (var i = 0; i < table.length; i++) {
    if (table[i] !== null) map[table[i]] = i;
  }
  // Construct results.
  var res = new Array(x.length);
  var nullValue = (useNull ? table.length - 1 : null);
  for (var i = 0; i < x.length; i++) {
    res[i] = (x[i] !== null ? map[x[i]] : nullValue);
  }
  return res;
};

var isFactor = function(o) {
  return (Array.isArray(o) && o.levels != null);
};

var factor = function(x, useNull) {
  if (isFactor(x)) {
    if (useNull && x.levels[x.levels.length - 1] !== null) {
      var tmp = x.slice(0, x.length);
      tmp.levels = x.levels;
      x = tmp;
      x.levels.push(null);
      for (var i = 0; i < x.length; i++) {
        if (x[i] === null) x[i] = x.levels.length - 1;
      }
    } else if (!useNull && x.levels[x.levels.length - 1] === null) {
      var tmp = x.slice(0, x.length);
      tmp.levels = x.levels;
      x = tmp;
      for (var i = 0; i < x.length; i++) {
        if (x[i] === x.levels.length - 1) x[i] = null;
      }
      x.levels.length--;
    }
    return x;
  }
  x = Array.isArray(x) ? x : [x];
  var levels = unique(x);
  if (!useNull && levels[levels.length - 1] === null) levels.length--;
  var f = match(x, levels, useNull);
  f.levels = levels;
  return f;
};

var asString = function(f) {
  if (!isFactor(f)) return String(f);

  // Construct map.
  var map = {};
  for (var i = 0; i < f.levels.length; i++) {
    map[i] = f.levels[i];
  }
  // Construct results.
  var res = new Array(f.length);
  for (var i = 0; i < f.length; i++) {
    res[i] = (f[i] !== null ? map[f[i]] : null);
  }
  return res;
};

exports.factor = factor;
exports.isFactor = isFactor;
exports.asString = asString;


//
// Cross tabulation related code.
//

var Table = function(dim, dimnames, array) {
  this.dim = dim;
  this.dimnames = dimnames;
  this.array = array;

  // Indices for level names
  this._levelIndices = new Array(this.dim.length);
  this._levelNullsIndex = new Array(this.dim.length);
  for (var i = 0; i < this.dim.length; i++) {
    this._levelIndices[i] = {};
    this._levelNullsIndex[i] = undefined;
    for (var j = 0; j < this.dimnames[i].names.length; j++) {
      if (this.dimnames[i].names[j] === null) {
        this._levelNullsIndex[i] = j;
      } else {
        this._levelIndices[i][this.dimnames[i].names[j]] = j;
      }
    }
  }

  // Used for calculate offset of indices.
  this._multipliers = new Array(this.dim.length);
  this._multipliers[this._multipliers.length - 1] = 1;
  for (var i = this._multipliers.length - 2; i >= 0; i--) {
    this._multipliers[i] = this._multipliers[i + 1] * this.dim[i + 1];
  }

  Object.defineProperties(this, {
    _levelIndices: {enumerable: false},
    _levelNullsIndex: {enumerable: false},
    _multipliers: {enumerable: false}
  });
};

Table.prototype._offset = function(ind) {
  var val = 0;
  for (var i = 0; i < ind.length; i++) {
    val += ind[i] * this._multipliers[i];
  }
  return val;
};
Object.defineProperty(Table.prototype, "_offset", {enumerable: false});

Table.prototype.get = function() {
  var indices = Array.prototype.slice.call(arguments);
  if (indices.length === 0) return this;

  // Normalize indices.
  for (var i = 0; i < this.dim.length; i++) {
    if (Array.isArray(indices[i])) {
      for (var j = 0; j < indices[i].length; j++) {
        if (typeof indices[i][j] !== "number") {
          // Normalize index to number.
          var ind = (indices[i][j] === null ? this._levelNullsIndex[i] : this._levelIndices[i][indices[i][j]]);
          if (ind === undefined)
            throw new Error("Variable '" + indices[i][j] + "' does not exist.");
          indices[i][j] = ind;
        }
      }
    } else if (indices[i] === undefined) {
      // Normalize undefined to the respective dim indices.
      indices[i] = new Array(this.dim[i]);
      for (var j = 0; j < indices[i].length; j++) {
        indices[i][j] = j;
      }
    } else if (typeof indices[i] !== "number") {
      // Normalize index to number.
      var ind = (indices[i] === null ? this._levelNullsIndex[i] : this._levelIndices[i][indices[i]]);
      if (ind === undefined)
        throw new Error("Variable '" + indices[i] + "' does not exist.");
      indices[i] = [ind];
    } else {
      indices[i] = [indices[i]];
    }
  }

  if (indices.every(function(ind) { return ind.length === 1 })) {
    // Retrieve a singular data.
    return this.array[this._offset(indices)];
  } else {
    // Retrieve as new Table instance.
    var dim = indices
      .map(function(ind) { return ind.length })
      .filter(function(len) { return len > 1 });
    var dimnames = this.dimnames
      .map(function(d, i) {
        return {
          dim: d.dim,
          names: indices[i].map(function(ind) { return d.names[ind] })
        };
      })
      .filter(function(d, i) { return indices[i].length > 1 });
    var array = new Array(dim.reduce(function(x, y) { return x * y }));

    var nextIndex = (function() {
      // Index initialization.
      var pos = new Array(indices.length);
      for (var i = 0; i < pos.length; i++) {
        pos[i] = 0;
      }

      return function(index) {
        var p, ind;

        // Set indices according pos position.
        for (var i = 0; i < index.length; i++) {
          index[i] = indices[i][pos[i]];
        }

        // Increase position.
        for (var i = pos.length - 1; i >= 0; i--) {
          p = pos[i];
          ind = indices[i];
          if (p + 1 < ind.length) {
            pos[i] = p + 1;
            break;
          } else {
            pos[i] = 0;
          }
        }

        return index;
      };
    }());

    var ind = new Array(indices.length);
    for (var i = 0; i < array.length; i++) {
      ind = nextIndex(ind);
      array[i] = this.array[this._offset(ind)];
    }

    return Object.freeze(new Table(dim, dimnames, array));
  }
};

var table = function(x) {
  var useNull, varNames, vars;

  if (typeof arguments[arguments.length - 1] === "boolean") {
    useNull = arguments[arguments.length - 1];
    arguments.length--;
  }

  if (arguments.length <= 1) {
    varNames = [""];
    vars = [factor(x, useNull)];
  } else {
    varNames = Array.prototype.slice.call(arguments, 1, arguments.length);
    vars = new Array(varNames.length);
    for (var i = 0; i < varNames.length; i++) {
      vars[i] = x[varNames[i]];
    }
    if (!vars.every(function(v) { return v.length === vars[0].length }))
      throw new Error("variables must have the same length.");
    for (var i = 0; i < varNames.length; i++) {
      vars[i] = factor(vars[i], useNull);
    }
  }

  var dimnames = new Array(vars.length);
  var dim = new Array(vars.length);
  var index = new Array(vars.length);

  // Assign dimnames and dim according to factor levels.
  for (var i = 0; i < vars.length; i++) {
    dimnames[i] = {
      dim: varNames[i],
      names: vars[i].levels.slice(0)
    };
    dim[i] = vars[i].levels.length;
  }

  var array = new Array(dim.reduce(function(x, y) { return x * y }));
  // Initialize all counts to zero.
  for (var i = 0; i < array.length; i++) {
    array[i] = 0;
  }

  var t = new Table(dim, dimnames, array);

  // Counts
  next: for (var i = 0; i < vars[0].length; i++) {
    for (var j = 0; j < vars.length; j++) {
      if (vars[j][i] == null) continue next;
      index[j] = vars[j][i];
    }
    array[t._offset(index)]++;
  }

  return Object.freeze(t);
};

exports.table = table;


//
// Functions on Table
//

var addMargins = function(table, margins, fun) {
  if (!Array.isArray(margins)) margins = [margins];

  var funIsArray = Array.isArray(fun);

  if (funIsArray && margins.length !== fun.length)
    throw new Error("Functions' number does not match margins' number.");

  // Clone dim and dimnames.
  var dim = table.dim.slice(0);
  var dimnames = table.dimnames.map(function(d) {
    return {
      dim: d.dim,
      names: d.names.slice(0)
    };
  });
  for (var i = 0; i < margins.length; i++) {
    if (margins[i] < dim.length) {
      if (funIsArray) {
        dim[margins[i]] += fun[i].length;
        for (var j = 0; j < fun[i].length; j++) {
          dimnames[margins[i]].names.push(fun[i][j].n);
        }
      } else {
        dim[margins[i]]++;
        dimnames[margins[i]].names.push(fun.n);
      }
    }
  }

  var array = new Array(dim.reduce(function(x, y) { return x * y }));
  var arrayIndex = 0;
  var blockSizes = table.dim.map(function(d, i) {
    return table.dim.slice(i).reduce(function(x, y) { return x * y });
  });
  var blockSizeDiffs = dim.map(function(d, i) {
    return (d - table.dim[i]) * (
      i + 1 < dim.length ?
      dim.slice(i + 1).reduce(function(x, y) { return x * y }) :
      1);
  });

  // Fill in with data first, leaving the necessary spaces to
  // be filled later.
  for (var i = 0; i < table.array.length; i++, arrayIndex++) {
    for (var j = 0; j < blockSizes.length; j++) {
      if (i >= blockSizes[j] && i % blockSizes[j] === 0) {
        arrayIndex += blockSizeDiffs[j];
        break;
      }
    }
    array[arrayIndex] = table.array[i];
  }

  var currentDim = table.dim.slice(0);
  var newBlockSizes = dim.map(function(d, i) {
    return dim.slice(i).reduce(function(x, y) { return x * y });
  });
  var addMargin = function(margin, funs) {
    var groups = 1;
    for (var i = margin - 1; i >= 0; i--) { groups *= currentDim[i]; }
    var currentBlockLength = (margin + 1 < currentDim.length ? currentDim[margin + 1] : 1);
    for (var i = margin + 2; i < currentDim.length; i++) {
      currentBlockLength *= currentDim[i];
    }
    var blockLength = (margin + 1 < dim.length ? dim[margin + 1] : 1);
    for (var i = margin + 2; i < dim.length; i++) {
      blockLength *= dim[i];
    }

    var a = new Array(currentDim[margin]);
    var addCalculation = function(group) {
      for (var i = 0; i < currentBlockLength; i++) {
        for (var j = 0; j < a.length; j++) {
          a[j] = array[group * newBlockSizes[margin] + j * blockLength + i];
        }

        for (var j = 0; j < funs.length; j++) {
          array[group * newBlockSizes[margin] + (currentDim[margin] + j) * blockLength + i] = funs[j].f(a);
        }
      }
    };

    for (var i = 0; i < groups; i++) {
      addCalculation(i);
    }
  };

  var singleFunList;
  if (!funIsArray) singleFunList = [fun];
  for (var i = 0; i < margins.length; i++) {
    if (funIsArray) {
      addMargin(margins[i], fun[i]);
      currentDim[margins[i]] += fun[i].length;
    } else {
      addMargin(margins[i], singleFunList);
      currentDim[margins[i]]++;
    }
  }

  return Object.freeze(new Table(dim, dimnames, array));
};

exports.addMargins = addMargins;
