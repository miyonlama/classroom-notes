"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var dir = path.join(root, "notes/discrete");
var nt = fs.readFileSync(path.join(dir, "iq-number-theory.html"), "utf8");
var counting = fs.readFileSync(path.join(dir, "iq-counting-and-discrete-probability.html"), "utf8");

function answer(html, prefix) {
  return html.split('<article class="iq-card">').find(function (c) { return c.indexOf(prefix) !== -1; });
}

var crt = answer(nt, "computations on large integers");
assert(crt, "missing CRT computation answer");
assert(crt.indexOf("1234 has residues (1, 4, 2)") !== -1, "1234 residues must be (1, 4, 2)");
assert(crt.indexOf("56 has residues (2, 6, 1)") !== -1, "56 residues must be (2, 6, 1)");
assert(crt.indexOf("sum has residues (3, 0, 3)") !== -1, "sum residues must be (3, 0, 3)");
assert(crt.indexOf("reconstructs to 300") !== -1, "reconstruction must be 300 mod 990");

var three = answer(counting, "How many three-digit integers");
assert(three, "missing three-digit answer");
assert(three.indexOf("sampling without replacement") !== -1,
  "three-digit count must be named as sampling without replacement");
assert(three.indexOf("generalized pigeonhole principle says") !== -1,
  "the pigeonhole principle must be stated correctly");
assert(three.indexOf("once a digit is used it cannot be reused, so each successive position has one fewer available digit") === -1,
  "pigeonhole must not be mislabeled as the product-rule count");

console.log("answer accuracy tests ok");
