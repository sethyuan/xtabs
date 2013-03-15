var unique, match,
    factor, isFactor, asString,
    Table, table;

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

Table = function(varNames, vars) {
  var index, offset, self = this;

  this.dimnames = new Array(vars.length);
  this.dim = new Array(vars.length);
  index = new Array(vars.length);

  // Assign dimnames and dim according to factor levels.
  for (var i = 0; i < vars.length; i++) {
    this.dimnames[i] = {
      dim: varNames[i],
      names: vars[i].levels
    };
    this.dim[i] = vars[i].levels.length;
  }

  this._array = new Array(this.dim.reduce(function(x, y) { return x * y; }));
  // Initialize all counts to zero.
  for (var i = 0; i < this._array.length; i++) {
    this._array[i] = 0;
  }

  offset = (function() {
    var multiplier = new Array(self.dim.length);
    multiplier[multiplier.length - 1] = 1;
    for (var i = multiplier.length - 2; i >= 0; i--) {
      multiplier[i] = multiplier[i + 1] * self.dim[i + 1];
    }

    return function(ind) {
      var val = 0;
      for (var i = 0; i < ind.length; i++) {
        val += ind[i] * multiplier[i];
      }
      return val;
    };
  }());

  next: for (var i = 0; i < vars[0].length; i++) {
    for (var j = 0; j < vars.length; j++) {
      if (vars[j][i] == null) continue next;
      index[j] = vars[j][i];
    }
    this._array[offset(index)]++;
  }
};

Table.prototype.get = function(i) {
  // TODO
  // if (typeof i === "number") return this.array[i];
  // return this.array[this._levelMap[i]];
  return 0;
};

table = function(x) {
  var useNull, t,
      varNames, vars;

  if (typeof arguments[arguments.length - 1] === "boolean") {
    useNull = arguments[arguments.length - 1];
    arguments.length--;
  }

  if (arguments.length <= 1) {
    return new Table([""], [factor(x, useNull)]);
  } else {
    varNames = Array.prototype.slice.call(arguments, 1, arguments.length);
    vars = new Array(varNames.length);
    for (var i = 0; i < varNames.length; i++) {
      vars[i] = factor(x[varNames[i]], useNull);
    }
    return new Table(varNames, vars);
  }
};

exports.table = table;
