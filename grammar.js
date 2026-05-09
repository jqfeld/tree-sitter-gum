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
      $.block,
      $.declare,
      $.include,
      $.key_value,
    ),

    // Key { ... }  or  _Key { ... }
    block: $ => seq(
      field('key', $.identifier),
      '{',
      repeat($._statement),
      '}',
    ),

    // Key Value [extra_values...]
    // Some statements have multiple values: "Reaction "f" rate", "Viewer path label "" """,
    // "Line val val val val". Extra values are restricted to non-letter-start types so
    // the next statement's identifier key is never accidentally consumed as an extra value.
    key_value: $ => seq(
      field('key', $.identifier),
      field('value', $._value),
      repeat(field('extra', $._extra_value)),
    ),

    // Values that can appear as extra arguments (after the first value).
    // Excludes bare_value (letter-start) to avoid consuming the next key as an extra.
    _extra_value: $ => choice(
      $.string,
      $.named_constant,
      $.quantity,
      $.paren_expr,
      $.env_path,
    ),

    // Declare name=expr  or  _Declare name=expr
    declare: $ => seq(
      $._declare_kw,
      field('name', $.bare_identifier),
      '=',
      field('value', $._value),
    ),

    _declare_kw: _ => token(choice('Declare', '_Declare')),

    // Include path
    include: $ => seq(
      'Include',
      field('path', $.include_path),
    ),

    include_path: _ => /[^\s{}"]+/,

    _value: $ => choice(
      $.string,
      $.named_constant,
      $.quantity,
      $.paren_expr,
      $.env_path,
      $.bare_value,
    ),

    // -----------------------------------------------------------------------
    // Quantities:  number  or  number*unit_expr  or  number/unit_expr
    // The /unit form handles "1e23/m^3/s" and "500/(Ohm*m)" patterns.
    // -----------------------------------------------------------------------
    quantity: $ => seq(
      $.number,
      optional(choice(
        seq('*', $.unit_expr),
        seq('/', $.unit_expr),
      )),
    ),

    number: _ => token(
      /[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,
    ),

    unit_expr: $ => $._unit_term,

    _unit_term: $ => choice(
      $.unit_div,
      $.unit_mul,
      $.unit_power,
      $.unit_func,
      $.unit_group,
      $.unit_neg,
      $.unit_add,
      $.unit_num,
      $.unit_atom,
    ),

    unit_div:      $ => prec.left(1, seq($._unit_term, '/', $._unit_term)),
    unit_mul:      $ => prec.left(2, seq($._unit_term, '*', $._unit_term)),
    unit_add:      $ => prec.left(0, seq($._unit_term, choice('+', '-'), $._unit_term)),
    unit_power:    $ => prec(3, seq($._unit_term, '^', $.unit_exponent)),
    unit_func:     $ => prec(5, seq($.unit_atom, $.unit_group)),
    unit_group:    $ => seq('(', $._unit_term, ')'),
    unit_neg:      $ => prec(4, seq('-', $._unit_term)),
    unit_num:      _ => /\d+\.?\d*([eE][+-]?\d+)?/,
    // unit_atom also covers named constants used in formulas: `kB, 'pi
    unit_atom:     _ => token(choice(
      /[A-Za-z_Ω°μ][A-Za-z_0-9Ω°μ]*/,
      /['`][A-Za-z_][A-Za-z_0-9]*/,
    )),
    // unit_exponent allows decimals: ^-2.26, ^0.5
    unit_exponent: _ => /[+-]?(\d+\.?\d*|\.\d+)/,

    // Named constants: 'pi, 'NA, 'kB  or backtick variant `pi
    named_constant: _ => token(choice(
      seq("'", /[A-Za-z_][A-Za-z_0-9]*/),
      seq('`', /[A-Za-z_][A-Za-z_0-9]*/),
    )),

    // Quoted string (allow multi-line for Annotation values)
    string: _ => token(seq('"', /[^"]*/, '"')),

    // Path values starting with $ (env-var substitution): $(VAR)/path/to/file
    env_path: _ => /\$[^\s\{\}\n]*/,

    // Bare value: identifiers, boolean flags, paths, species names, state labels.
    // Two forms:
    //   letter-start: Atom, Yes, No, Ar[m], Hg^+, data/, minA'*A
    //   digit-start:  6s, 6p1, 7d, 3s2.3p5.(2P<3/2>).4s — quantum state labels (must contain a letter)
    // <, >, (, ) allowed in digit-start to handle spectroscopic notation like (2P<3/2>)
    bare_value: _ => token(choice(
      /[A-Za-z_][A-Za-z_0-9\[\]\+\-\.\/\^\'\*]*/,
      /\d+[A-Za-z][A-Za-z_0-9\[\]\+\-\.\/\^\'\*\(\)<>]*/,
    )),

    // Parenthesized expression: used for function body values like (1-r/r_max)*160*K+300*K
    // Handles nested parens recursively. The tail (e.g. *160*K) uses token.immediate
    // so it only matches characters directly after ) with no intervening whitespace,
    // preventing the extras mechanism from pulling in the next line's content.
    paren_expr: $ => seq(
      '(',
      repeat(choice(
        /[^()\{\}\n]+/,
        $.paren_expr,
      )),
      ')',
      optional(token.immediate(/[^\s\(\)\{\}\n]+/)),
    ),

    // Identifiers for keys: optional _ prefix (disabled blocks/declares)
    // Species names in keys can contain [, ], +, -
    identifier: _ => /`?_?[A-Za-z][A-Za-z_0-9\[\]\+\-\.]*/,

    // Plain identifier for Declare LHS
    bare_identifier: _ => /[A-Za-z_][A-Za-z_0-9]*/,

    // # line comment
    comment: _ => token(seq('#', /[^\r\n]*/)),
  },
});
