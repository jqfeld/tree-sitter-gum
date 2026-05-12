/**
 * @file Parser for .gum and .gin files used in PLASIMO
 * @author Jan Kuhfeld <jankuhfeld@plasma-matters.nl>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'gum',

  extras: $ => [
    /[ \t]/,
    $.comment,
  ],


  rules: {
    source_file: $ => repeat($._statement),
    // # line comment
    comment: _ => token(seq('#', /[^\r\n]*/)),
    _newline: _ => token(/\n/),

    _statement: $ => choice(
      $.leafblock,
      $.leafblock_disabled,
      $.declare,
      $.include,
      $.key_value,
      $.key_value_disabled,
      $._newline,
    ),

    // Key { ... }  or  _Key { ... }
    leafblock: $ => seq(
      field('key', $.identifier),
      '{',
      repeat($._statement),
      '}',
    ),
    leafblock_disabled: $ => seq(
      field('key', $.identifier_disabled),
      '{',
      repeat($._statement),
      '}',
    ),





    // Declare name=expr  or  _Declare name=expr
    declare: $ => seq(
      token("Declare"),
      field('name', $.identifier),
      '=',
      field('value', $._value),
    ),


    // Include path
    include: $ => seq(
      token('Include'),
      field('path', $.include_path),
    ),
    include_path: _ => /[^\s{}"]+/,

    // Identifiers for keys: optional _ prefix (disabled blocks/declares)
    // Species names in keys can contain [, ], +, -
    identifier: _ => /[A-Za-z][A-Za-z_0-9\[\]\+\-\.]*/,
    identifier_disabled: _ => /_?[A-Za-z][A-Za-z_0-9\[\]\+\-\.]*/,

    // Key Value [extra_values...]
    // Some statements have multiple values: "Reaction "f" rate", "Viewer path label "" """,
    // "Line val val val val". 
    // Needs to end at \n to avoid parsing following keys as values
    key_value: $ => seq(
      field('key', $.identifier),
      field('value', $._value),
      optional(repeat(field('value', $._value))),
      $._newline,
    ),


    key_value_disabled: $ => seq(
      field('key', $.identifier_disabled),
      field('value', $._value),
      optional(repeat(field('value', $._value))),
      $._newline,
    ),


    _value: $ => choice(
      $.string,
      $.env_path,
      $.number,
      $.bare_value
    ),




    // Quoted string (allow multi-line for Annotation values)
    string: _ => token(seq('"', /[^"]*/, '"')),

    // Named constants: 'pi, 'NA, 'kB  or backtick variant `pi
    named_constant: _ => token(choice(
      seq("'", /[A-Za-z_][A-Za-z_0-9]*/),
      seq('`', /[A-Za-z_][A-Za-z_0-9]*/),
    )),

    number: _ => token(
      /[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,
    ),


    // Path values starting with $ (env-var substitution): $(VAR)/path/to/file
    env_path: _ => /\$[^\s\{\}\n]*/,

    bare_value: _ => token(/\S+/),

  },
});
