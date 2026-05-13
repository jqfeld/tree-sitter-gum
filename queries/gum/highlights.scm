(
 (leafblock_disabled) @comment @nospell
 (#set! "priority" 200) ; overwrites all other highlights, applies @comment exclusively
)
(
 (key_value_disabled) @comment @nospell
 (#set! "priority" 200)
)

(identifier) @module
(string) @string
(bare_value) @variable
(number) @number

(
 (key_value key:(identifier) @_key)
 (#eq? @_key "Type")
) @keyword.type
