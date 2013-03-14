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

  it("a single factor", function() {
    var x = xtabs.factor(["Male", "Female", "Female", "Female", "Male", "Female"]),
        t = xtabs.table(x);
    (t instanceof xtabs.Table).should.be.true;
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
  });

  it("a single vector (array)", function() {
    var x = ["Male", "Female", "Female", "Female", "Male", "Female"],
        t = xtabs.table(x);
    (t instanceof xtabs.Table).should.be.true;
    t.get("Male").should.equal(2);
    t.get("Female").should.equal(4);
    t.get(0).should.equal(2);
    t.get(1).should.equal(4);
  });

  it("a single factor counting NA (aka null)");

  it("a data frame (an object with array members)");

  it("a data frame of factor members");

  it("a data frame of factor members counting NA (aka null)");
});
