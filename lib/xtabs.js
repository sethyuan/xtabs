var unique, match,
    factor, isFactor, asString,
    Table, table, constructTable;

//
// Factor related code.
//

unique = function(x) {
  var set = {}, hasNull = false;
  for (var i = 0; i < x.length; i++) {
    if (x[i] === null) hasNull = true;
    else if (set[x[i]] == null) set[x[i]] = true;
  }
  return hasNull ? Object.keys(set).concat(null) : Object.keys(set);
};

match = function(x, table, useNull) {
  var map, res,
      nullValue = (useNull ? table.length - 1 : null);
  // Construct map.
  map = {};
  for (var i = 0; i < table.length; i++) {
    if (table[i] !== null) map[table[i]] = i;
  }
  // Construct results.
  res = new Array(x.length);
  for (var i = 0; i < x.length; i++) {
    res[i] = (x[i] !== null ? map[x[i]] : nullValue);
  }
  return res;
};

factor = function(x, useNull) {
  var f, levels, tmp;
  if (isFactor(x)) {
    if (useNull && x.levels[x.levels.length - 1] !== null) {
      tmp = x.slice(0, x.length);
      tmp.levels = x.levels;
      x = tmp;
      x.levels.push(null);
      for (var i = 0; i < x.length; i++) {
        if (x[i] === null) x[i] = x.levels.length - 1;
      }
    } else if (!useNull && x.levels[x.levels.length - 1] === null) {
      tmp = x.slice(0, x.length);
      tmp.levels = x.levels;
      x = tmp;
      for (var i = 0; i < x.length; i++) {
        if (x[i] === x.levels.length - 1) x[i] = null;
      }
      x.levels.length - 1;
    }
    return x;
  }
  x = Array.isArray(x) ? x : [x];
  levels = unique(x);
  if (!useNull && levels[levels.length - 1] === null) levels.length--;
  f = match(x, levels, useNull);
  f.levels = levels;
  return f;
};

isFactor = function(o) {
  return (Array.isArray(o) && o.levels != null);
};

asString = function(f) {
  var map, res;
  if (!isFactor(f)) return String(f);

  // Construct map.
  map = {};
  for (var i = 0; i < f.levels.length; i++) {
    map[i] = f.levels[i];
  }
  // Construct results.
  res = new Array(f.length);
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

Table = function(dim, dimnames, array) {
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
  var indices = Array.prototype.slice.call(arguments), ind,
      dim, dimnames, array, t, nextIndex;
  if (indices.length === 0) return this;

  // Normalize indices.
  for (var i = 0; i < this.dim.length; i++) {
    if (Array.isArray(indices[i])) {
      for (var j = 0; j < indices[i].length; j++) {
        if (typeof indices[i][j] !== "number") {
          // Normalize index to number.
          ind = (indices[i][j] === null ? this._levelNullsIndex[i] : this._levelIndices[i][indices[i][j]]);
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
      ind = (indices[i] === null ? this._levelNullsIndex[i] : this._levelIndices[i][indices[i]]);
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
    dim = indices
      .map(function(ind) { return ind.length })
      .filter(function(len) { return len > 1 });
    dimnames = this.dimnames
      .map(function(d, i) {
        return {
          dim: d.dim,
          names: indices[i].map(function(ind) { return d.names[ind] })
        };
      })
      .filter(function(d, i) { return indices[i].length > 1 });
    array = new Array(dim.reduce(function(x, y) { return x * y }));

    nextIndex = (function() {
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

    ind = new Array(indices.length);
    for (var i = 0; i < array.length; i++) {
      ind = nextIndex(ind);
      array[i] = this.array[this._offset(ind)];
    }

    return Object.freeze(new Table(dim, dimnames, array));
  }
};

constructTable = function(varNames, vars) {
  var index, t,
      dim, dimnames, array;

  dimnames = new Array(vars.length);
  dim = new Array(vars.length);
  index = new Array(vars.length);

  // Assign dimnames and dim according to factor levels.
  for (var i = 0; i < vars.length; i++) {
    dimnames[i] = {
      dim: varNames[i],
      names: vars[i].levels
    };
    dim[i] = vars[i].levels.length;
  }

  array = new Array(dim.reduce(function(x, y) { return x * y; }));
  // Initialize all counts to zero.
  for (var i = 0; i < array.length; i++) {
    array[i] = 0;
  }

  t = new Table(dim, dimnames, array);

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

table = function(x) {
  var useNull, t,
      varNames, vars;

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
  return constructTable(varNames, vars);
};

exports.table = table;
