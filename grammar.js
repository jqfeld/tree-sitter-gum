/**
 * @file Parser for .gum and .gin files used in PLASIMO
 * @author Jan Kuhfeld <jankuhfeld@plasma-matters.nl>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "plasimo",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
