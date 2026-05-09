package tree_sitter_plasimo_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_plasimo "github.com/tree-sitter/tree-sitter-plasimo/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_plasimo.Language())
	if language == nil {
		t.Errorf("Error loading Plasimo grammar")
	}
}
