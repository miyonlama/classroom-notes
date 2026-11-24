"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var dir = path.join(root, "notes/discrete");
function answer(file, prefix) {
  var s = fs.readFileSync(path.join(dir, file), "utf8");
  return s.split('<article class="iq-card">').find(function (c) { return c.indexOf(prefix) !== -1; });
}

var dm = answer("iq-sets-relations-functions.html", "Venn diagrams with");
assert(dm.indexOf("the complement of A ∪ B equals Ā ∩ B̄") !== -1,
  "De Morgan union complement must be stated correctly");
assert(dm.indexOf("the complement of A ∩ B equals Ā ∪ B̄") !== -1,
  "De Morgan intersection complement must be stated correctly");

var euler = answer("iq-trees-and-graphs.html", "Compare it with a Hamiltonian path");
assert(euler.indexOf("K₁,₃") !== -1 && euler.indexOf("no Hamiltonian path") !== -1,
  "the three-leaf star cannot have a Hamiltonian path");

var cubes = answer("iq-induction-and-recursion.html", "is a perfect square");
assert(cubes.indexOf("[C(n + 1, 2)]²") !== -1,
  "the cube sum is the square of the triangular number");

var grades = answer("iq-counting-and-discrete-probability.html", "minimum number of possible distinct grades");
assert(grades.indexOf("largest k that works") === -1,
  "grade-count answer must not contradict itself");
assert(grades.indexOf("k = 23") !== -1 && grades.indexOf("k = 24") !== -1,
  "grade-count answer must compare 23 and 24 consistently");

var incidence = answer("iq-trees-and-graphs.html", "incidence-matrix representation");
assert(incidence.indexOf("non-bipartite") !== -1 && incidence.indexOf("rank n") !== -1,
  "0/1 incidence matrix rank must account for non-bipartite graphs");

console.log("answer accuracy 2 tests ok");
