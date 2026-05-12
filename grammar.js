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
    /\s/,
    $.comment,
  ],

  rules: {
    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.leafblock,
      $.leafblock_disabled,
      $.declare,
      $.declare_disabled,
      $.include,
      $.key_value,
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


    // Identifiers for keys: optional _ prefix (disabled blocks/declares)
    // Species names in keys can contain [, ], +, -
    identifier: _ => /[A-Za-z][A-Za-z_0-9\[\]\+\-\.]*/,
    identifier_disabled: _ => /_?[A-Za-z][A-Za-z_0-9\[\]\+\-\.]*/,


    // # line comment
    comment: _ => token(seq('#', /[^\r\n]*/)),

    // Key Value [extra_values...]
    // Some statements have multiple values: "Reaction "f" rate", "Viewer path label "" """,
    // "Line val val val val". Extra values are restricted to non-letter-start types so
    // the next statement's identifier key is never accidentally consumed as an extra value.
    key_value: $ => seq(
      field('key', $.identifier),
      field('value', $._value),
      repeat(field('value', $._value)),
    ),


    key_value_disabled: $ => seq(
      field('key', $.identifier_disabled),
      field('value', $._value),
      repeat(field('value', $._value)),
    ),


    _value: $ => choice(
      $.string,
      $.env_path,
      $.bare_value,
    ),


    // Declare name=expr  or  _Declare name=expr
    declare: $ => seq(
      "Declare",
      field('name', $.identifier),
      '=',
      field('value', $._value),
    ),


    // Include path
    include: $ => seq(
      'Include',
      field('path', $.include_path),
    ),

    include_path: _ => /[^\s{}"]+/,


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
