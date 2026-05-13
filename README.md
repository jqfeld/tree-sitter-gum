# Introduction

Tree-sitter parser for PLASIMO's gum file format.

# Installation

## Neovim

Installation depends on the used plugin manager. 
The `nvim-treesitter` plugin is needed. At the start of its config function add
the following lua snippet:

```lua
      local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
      parser_config.gum = {
        install_info = {
          url = "/path/to/this/directory",
          branch = "main",
          files = { "src/parser.c" },
          generate_requires_npm = false,
          requires_generate_from_grammar = false,
        },
        filetype = "gum",
      }

```

Additionally, it is necessary to register the `gum` filetype for the endings `.gum` and `.gin`.
```lua
vim.filetype.add({
  extension = {
    gum = "gum",
    gin = "gum",
  }
})
```

And finally, copy the query folder `./queries/gum` into `$XDG_CONFIG_DIR/nvim/queries`. 
