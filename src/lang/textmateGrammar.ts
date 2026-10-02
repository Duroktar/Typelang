/**
 * TypeLang TextMate Grammar & VS Code Extension Exporter
 * Provides the complete TextMate grammar (typelang.tmLanguage.json)
 * and VS Code extension configuration for local IDE support.
 */

export const TYPELANG_TM_LANGUAGE = {
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "TypeLang",
  "scopeName": "source.typelang",
  "fileTypes": ["tl", "typelang"],
  "patterns": [
    { "include": "#comments" },
    { "include": "#strings" },
    { "include": "#numbers" },
    { "include": "#constants" },
    { "include": "#keywords" },
    { "include": "#operators" },
    { "include": "#declarations" },
    { "include": "#types" },
    { "include": "#functions" },
    { "include": "#punctuation" },
    { "include": "#identifiers" }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.block.documentation.typelang",
          "begin": "/\\*\\*",
          "end": "\\*/",
          "patterns": [
            {
              "name": "keyword.other.documentation.typelang",
              "match": "@(param|returns?|type|example|throws?|deprecated)\\b"
            }
          ]
        },
        {
          "name": "comment.block.typelang",
          "begin": "/\\*",
          "end": "\\*/"
        },
        {
          "name": "comment.line.double-slash.typelang",
          "match": "//.*$"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.double.typelang",
          "begin": "\"",
          "end": "\"",
          "patterns": [
            {
              "name": "constant.character.escape.typelang",
              "match": "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\\{[0-9A-Fa-f]+\\}|[0-7]{3}|[\\\\\"'abfnrtv0])"
            }
          ]
        },
        {
          "name": "string.quoted.single.typelang",
          "begin": "'",
          "end": "'",
          "patterns": [
            {
              "name": "constant.character.escape.typelang",
              "match": "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\\{[0-9A-Fa-f]+\\}|[0-7]{3}|[\\\\\"'abfnrtv0])"
            }
          ]
        },
        {
          "name": "string.template.typelang",
          "begin": "`",
          "end": "`",
          "patterns": [
            {
              "name": "constant.character.escape.typelang",
              "match": "\\\\."
            },
            {
              "name": "meta.embedded.line.typelang",
              "begin": "\\$\\{",
              "end": "\\}",
              "beginCaptures": {
                "0": { "name": "punctuation.definition.template-expression.begin.typelang" }
              },
              "endCaptures": {
                "0": { "name": "punctuation.definition.template-expression.end.typelang" }
              },
              "patterns": [
                { "include": "$self" }
              ]
            }
          ]
        }
      ]
    },
    "numbers": {
      "patterns": [
        {
          "name": "constant.numeric.hex.typelang",
          "match": "\\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\\b"
        },
        {
          "name": "constant.numeric.binary.typelang",
          "match": "\\b0[bB][01][01_]*\\b"
        },
        {
          "name": "constant.numeric.octal.typelang",
          "match": "\\b0[oO][0-7][0-7_]*\\b"
        },
        {
          "name": "constant.numeric.float.typelang",
          "match": "\\b[0-9][0-9_]*\\.[0-9][0-9_]*([eE][+-]?[0-9][0-9_]*)?\\b"
        },
        {
          "name": "constant.numeric.integer.typelang",
          "match": "\\b[0-9][0-9_]*([eE][+-]?[0-9][0-9_]*)?\\b"
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "name": "constant.language.boolean.true.typelang",
          "match": "\\btrue\\b"
        },
        {
          "name": "constant.language.boolean.false.typelang",
          "match": "\\bfalse\\b"
        },
        {
          "name": "constant.language.null.typelang",
          "match": "\\b(null|undefined)\\b"
        },
        {
          "name": "variable.language.self.typelang",
          "match": "\\bself\\b"
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.flow.typelang",
          "match": "\\b(if|else|then|return|switch|case|default|break|continue)\\b"
        },
        {
          "name": "keyword.control.loop.typelang",
          "match": "\\b(for|while|in)\\b"
        },
        {
          "name": "keyword.control.match.typelang",
          "match": "\\bmatch\\b"
        },
        {
          "name": "keyword.control.monad.do.typelang",
          "match": "\\bdo\\b"
        },
        {
          "name": "keyword.other.pure.typelang",
          "match": "\\bpure\\b"
        },
        {
          "name": "keyword.other.where.typelang",
          "match": "\\bwhere\\b"
        },
        {
          "name": "keyword.other.declaration.typelang",
          "match": "\\b(module|export|import|extern|as|type|pack|unpack)\\b"
        },
        {
          "name": "storage.type.function.typelang",
          "match": "\\b(function|fn)\\b"
        },
        {
          "name": "storage.type.variable.typelang",
          "match": "\\blet\\b"
        },
        {
          "name": "storage.modifier.mut.typelang",
          "match": "\\bmut\\b"
        }
      ]
    },
    "declarations": {
      "patterns": [
        {
          "match": "\\b(module)\\s+([A-Za-z_][A-Za-z0-9_]*)",
          "captures": {
            "1": { "name": "keyword.other.declaration.typelang" },
            "2": { "name": "entity.name.type.module.typelang" }
          }
        },
        {
          "match": "\\b(type)\\s+([A-Za-z_][A-Za-z0-9_]*)",
          "captures": {
            "1": { "name": "keyword.other.declaration.typelang" },
            "2": { "name": "entity.name.type.alias.typelang" }
          }
        },
        {
          "match": "\\b(import)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s+(from)",
          "captures": {
            "1": { "name": "keyword.other.declaration.typelang" },
            "2": { "name": "variable.other.readwrite.typelang" },
            "3": { "name": "keyword.other.declaration.typelang" }
          }
        },
        {
          "match": "\\b(extern)\\s+(function|fn)\\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "keyword.other.declaration.typelang" },
            "2": { "name": "storage.type.function.typelang" },
            "3": { "name": "entity.name.function.typelang" }
          }
        }
      ]
    },
    "operators": {
      "patterns": [
        {
          "name": "keyword.operator.bind.typelang",
          "match": "<-"
        },
        {
          "name": "keyword.operator.arrow.fat.typelang",
          "match": "=>"
        },
        {
          "name": "keyword.operator.arrow.skinny.typelang",
          "match": "->"
        },
        {
          "name": "keyword.operator.range.inclusive.typelang",
          "match": "\\.\\.="
        },
        {
          "name": "keyword.operator.range.exclusive.typelang",
          "match": "\\.\\."
        },
        {
          "name": "keyword.operator.spread.typelang",
          "match": "\\.\\.\\."
        },
        {
          "name": "keyword.operator.comparison.typelang",
          "match": "(==|!=|<=|>=|<|>)"
        },
        {
          "name": "keyword.operator.assignment.compound.typelang",
          "match": "(\\+=|-=|\\*=|/=|%=)"
        },
        {
          "name": "keyword.operator.assignment.typelang",
          "match": "="
        },
        {
          "name": "keyword.operator.logical.typelang",
          "match": "(&&|\\|\\||!)"
        },
        {
          "name": "keyword.operator.arithmetic.typelang",
          "match": "(\\+|-|\\*|/|%)"
        },
        {
          "name": "keyword.operator.type.union.typelang",
          "match": "\\|"
        },
        {
          "name": "keyword.operator.type.intersection.typelang",
          "match": "&"
        },
        {
          "name": "keyword.operator.ternary.typelang",
          "match": "\\?"
        }
      ]
    },
    "types": {
      "patterns": [
        {
          "name": "support.type.primitive.typelang",
          "match": "\\b(number|boolean|string|void|any|never|unknown)\\b"
        },
        {
          "name": "support.type.builtin.typelang",
          "match": "\\b(Option|Result|List|Array|Map|Set|Promise|Some|None|Ok|Err)\\b"
        },
        {
          "name": "entity.name.type.gadt.typelang",
          "match": "\\b[A-Z][a-zA-Z0-9_]*\\b"
        }
      ]
    },
    "functions": {
      "patterns": [
        {
          "match": "\\b(function|fn)\\s+([a-zA-Z_][a-zA-Z0-9_]*)",
          "captures": {
            "1": { "name": "storage.type.function.typelang" },
            "2": { "name": "entity.name.function.typelang" }
          }
        },
        {
          "match": "\\b([a-zA-Z_][a-zA-Z0-9_]*)\\s*(?=\\()",
          "name": "entity.name.function.call.typelang"
        }
      ]
    },
    "punctuation": {
      "patterns": [
        {
          "name": "punctuation.terminator.statement.typelang",
          "match": ";"
        },
        {
          "name": "punctuation.separator.comma.typelang",
          "match": ","
        },
        {
          "name": "punctuation.separator.colon.typelang",
          "match": ":"
        },
        {
          "name": "punctuation.separator.period.typelang",
          "match": "\\."
        },
        {
          "name": "punctuation.brackets.round.typelang",
          "match": "[()]"
        },
        {
          "name": "punctuation.brackets.curly.typelang",
          "match": "[{}]"
        },
        {
          "name": "punctuation.brackets.square.typelang",
          "match": "[\\[\\]]"
        }
      ]
    },
    "identifiers": {
      "patterns": [
        {
          "name": "variable.other.readwrite.typelang",
          "match": "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }
      ]
    }
  }
};

export const TYPELANG_LANGUAGE_CONFIGURATION = {
  "comments": {
    "lineComment": "//",
    "blockComment": ["/*", "*/"]
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  "autoClosingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"" },
    { "open": "'", "close": "'" },
    { "open": "`", "close": "`" }
  ],
  "surroundingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"" },
    { "open": "'", "close": "'" },
    { "open": "`", "close": "`" }
  ],
  "folding": {
    "markers": {
      "start": "^\\s*//\\s*#?region\\b",
      "end": "^\\s*//\\s*#?endregion\\b"
    }
  }
};

export const TYPELANG_VSCODE_PACKAGE_JSON = {
  "name": "typelang-syntax",
  "displayName": "TypeLang Language Support",
  "description": "Rich syntax highlighting and language configuration for TypeLang (.tl)",
  "version": "0.2.0",
  "publisher": "typelang-community",
  "engines": {
    "vscode": "^1.70.0"
  },
  "categories": ["Programming Languages"],
  "contributes": {
    "languages": [
      {
        "id": "typelang",
        "aliases": ["TypeLang", "typelang", "tl"],
        "extensions": [".tl", ".typelang"],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "typelang",
        "scopeName": "source.typelang",
        "path": "./syntaxes/typelang.tmLanguage.json"
      }
    ]
  }
};

/**
 * Initiates direct browser download of the typelang.tmLanguage.json file.
 */
export function downloadTextMateGrammar(): void {
  const content = JSON.stringify(TYPELANG_TM_LANGUAGE, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'typelang.tmLanguage.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Initiates direct browser download of a complete VS Code extension bundle (zip or individual files)
 */
export function downloadLanguageConfiguration(): void {
  const content = JSON.stringify(TYPELANG_LANGUAGE_CONFIGURATION, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'language-configuration.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadVSCodeManifest(): void {
  const content = JSON.stringify(TYPELANG_VSCODE_PACKAGE_JSON, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'package.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
