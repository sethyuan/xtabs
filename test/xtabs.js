var xtabs = require("../"),
    should = require("should");

describe("xtabs", function() {
  describe("factor", function() {
    it("a vector (array)", function() {
      var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
          factoredX = xtabs.factor(x);
      factoredX.length.should.equal(x.length);
      factoredX.slice(0, x.length).should.eql([0, 1, 1, 1, 0, 1]);
      factoredX.levels.should.eql(["Male", "Female"]);
    });

    it("isFactor", function() {
      var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
          factoredX = xtabs.factor(x);
      xtabs.isFactor(factoredX).should.be.true;
    });

    it("pushing", function() {
      var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
          factoredX = xtabs.factor(x);
      factoredX.push(1);
      factoredX.length.should.equal(x.length + 1);
      factoredX[factoredX.length - 1].should.equal(1);
    });

    it("convert back to string", function() {
      var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
          factoredX = xtabs.factor(x);
      xtabs.asString(factoredX).should.be.eql(x);
    });

    it("with NA (aka null)", function() {
      var x = ["Male", "Female", null, "Female", null, "Female"],
          factoredX = xtabs.factor(x, true);
      factoredX.levels.should.eql(["Male", "Female", null]);
      factoredX.slice(0, x.length).should.eql([0, 1, 2, 1, 2, 1]);
    });

    it("without NA (aka null)", function() {
      var x = ["Male", "Female", null, "Female", null, "Female"],
          factoredX = xtabs.factor(x);
      factoredX.levels.should.eql(["Male", "Female"]);
      factoredX.slice(0, x.length).should.eql([0, 1, null, 1, null, 1]);
    });

    it("with 'null' string and without null", function() {
      var x = ["Male", "Female", "Female", "null", "Female", "Male", null, "Female"],
          factoredX = xtabs.factor(x);
      factoredX.length.should.equal(x.length);
      factoredX.slice(0, x.length).should.eql([0, 1, 1, 2, 1, 0, null, 1]);
      factoredX.levels.should.eql(["Male", "Female", "null"]);
    });

    it("with 'null' string and with null", function() {
      var x = ["Male", "Female", "null", "Female", null, "Female"],
          factoredX = xtabs.factor(x, true);
      factoredX.levels.should.eql(["Male", "Female", "null", null]);
      factoredX.slice(0, x.length).should.eql([0, 1, 2, 1, 3, 1]);
    });

    it("convert back to string with null used", function() {
      var x = ["Male", "Female", null, "Female", null, "Female"],
          factoredX = xtabs.factor(x, true);
      xtabs.asString(factoredX).should.be.eql(x);
    });

    it("convert back to string with null not used", function() {
      var x = ["Male", "Female", null, "Female", null, "Female"],
          factoredX = xtabs.factor(x);
      xtabs.asString(factoredX).should.be.eql(x);
    });
  });

  it("single factor", function() {
    var x = xtabs.factor(["Male", "Female", "Female", "Female", "Male", "Female"]),
        t = xtabs.table(x);
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
    t.dim.should.eql([2]);
    t.dimnames[0].names.should.eql(["Male", "Female"]);
  });

  it("single vector (array)", function() {
    var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
        t = xtabs.table(x);
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
    t.dim.should.eql([2]);
    t.dimnames[0].names.should.eql(["Male", "Female"]);
  });

  it("single factor with 'null' string", function() {
    var x = xtabs.factor(["Male", "Female", "Female", "Female", "null", "Male", null, "Female"]),
        t = xtabs.table(x);
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get("null").should.equal(1);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
    t.get(2).should.equal(1);
    t.dim.should.eql([3]);
    t.dimnames[0].names.should.eql(["Male", "Female", "null"]);
  });

  it("single factor counting NA (aka null)", function() {
    var x = xtabs.factor(["Male", "Female", "Female", "Female", "null", "Male", null, "Female"]),
        t = xtabs.table(x, true);
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get("null").should.equal(1);
    t.get(null).should.equal(1);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
    t.get(2).should.equal(1);
    t.get(3).should.equal(1);
    t.dim.should.eql([4]);
    t.dimnames[0].names.should.eql(["Male", "Female", "null", null]);
  });

  it("data frame (an object with array members)", function() {
    var data = {
      gender: xtabs.factor(["M", "F", "M", null, "F", "M", "M"])
    };
    var t = xtabs.table(data, "gender");
    t.dim.should.eql([2]);
    t.dimnames[0].names.should.eql(["Male", "Female"]);
    t.get("M").should.equal(4);
    t.get("F").should.equal(2);
    t.get(0).should.equal(4);
    t.get(1).should.equal(2);
  });

  it("data frame with 2 variables", function() {
    var data = {
      department: xtabs.factor(["MIS", "MIS", "HR", "TR", null, "TR", "MIS"]),
      gender: xtabs.factor(["M", "F", null, "M", "F", "M", "M"])
    };
    var t = xtabs.table(data, "department", "gender");
    t.dim.should.eql([3, 2]);
    t.get("HR", "M").should.equal(0);
    t.get("HR", "F").should.equal(0);
    t.get(null, "M").get("TR").should.equal(2);
    t.get(null, "M").get(2).should.equal(2);
    t.get(0, null).dim.should.eql([2]);
    t.get(0, null).dimnames[0].names.should.eql(["M", "F"]);
  });

  it("data frame with 3 variables");

  it("data frame counting NA (aka null)", function() {
    var data = {
      department: xtabs.factor(["MIS", "MIS", "HR", "TR", null, "TR", "MIS"]),
      gender: xtabs.factor(["M", "F", null, "M", "F", "M", "M"])
    };
    var t = xtabs.table(data, "department", "gender", true);
    t.dim.should.eql([4, 3]);
  });
});
