var unique, match,
    factor, isFactor, asString,
    Table, table;

//
// Factor related code.
//

unique = function(x) {
  var set = {}, hasNull = false, i;
  for (i = 0; i < x.length; i++) {
    if (x[i] === null) hasNull = true;
    else if (set[x[i]] == null) set[x[i]] = true;
  }
  return hasNull ? Object.keys(set).concat(null) : Object.keys(set);
};

match = function(x, table, useNull) {
  var map, res, i,
      nullValue = (useNull ? table.length - 1 : null);
  // Construct map.
  map = {};
  for (i = 0; i < table.length; i++) {
    if (table[i] !== null) map[table[i]] = i;
  }
  // Construct results.
  res = new Array(x.length);
  for (i = 0; i < x.length; i++) {
    res[i] = (x[i] !== null ? map[x[i]] : nullValue);
  }
  return res;
};

factor = function(x, useNull) {
  var f, levels;
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
  var map, i, res;
  if (!isFactor(f)) return String(f);

  // Construct map.
  map = {};
  for (i = 0; i < f.levels.length; i++) {
    map[i] = f.levels[i];
  }
  // Construct results.
  res = new Array(f.length);
  for (i = 0; i < f.length; i++) {
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

Table = function() {
  this._indices = [];
};

Table.prototype.get = function() {
  // TODO
};

exports.table = function(x) {
  // var t, i;
  // x = isFactor(x) ? x : factor(x);
  // t = new Table();
  // for (i = 0; i < x.levels.length; i++) {
  //   t._indices[i] = 0;
  // }
  // for (i = 0; i < x.length; i++) {
  //   t._indices[x[i]]++;
  // }
  // return t;
};
