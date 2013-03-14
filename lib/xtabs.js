var unique, match;

unique = function(x) {
  var set = {}, i, hasNull = false;
  for (i = 0; i < x.length; i++) {
    if (x[i] === null) hasNull = true;
    else if (set[x[i]] == null) set[x[i]] = true;
  }
  return hasNull ? Object.keys(set).concat(null) : Object.keys(set);
};

match = function(x, table, useNull) {
  var map = {}, res = new Array(x.length),
      nullValue = (useNull ? table.length - 1 : null), i;
  // Construct map.
  for (i = 0; i < table.length; i++) {
    if (table[i] !== null) map[table[i]] = i;
  }
  // Construct results.
  for (i = 0; i < x.length; i++) {
    res[i] = (x[i] !== null ? map[x[i]] : nullValue);
  }
  return res;
};

exports.factor = function(x, useNull) {
  var f, levels;
  levels = unique(x);
  if (!useNull && levels[levels.length - 1] === null) levels.length--;
  f = match(x, levels, useNull);
  f.levels = levels;
  return f;
};

exports.isFactor = function(o) {
  return (Array.isArray(o) && o.levels != null);
};

exports.asString = function(f) {
  var map = {}, i, res = new Array(f.length);
  // Construct map.
  for (i = 0; i < f.levels.length; i++) {
    map[i] = f.levels[i];
  }
  // Construct results.
  for (i = 0; i < f.length; i++) {
    res[i] = (f[i] !== null ? map[f[i]] : null);
  }
  return res;
};
