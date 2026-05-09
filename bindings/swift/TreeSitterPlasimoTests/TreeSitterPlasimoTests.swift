import XCTest
import SwiftTreeSitter
import TreeSitterPlasimo

final class TreeSitterPlasimoTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_plasimo())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Plasimo grammar")
    }
}
