import { ExampleProgram } from "./types";

export const example33SwitchAndListComp: ExampleProgram = {
  id: 'switch_and_list_comp',
  name: '33. Switch Statement & List Comprehensions',
  category: 'Language Features',
  description: 'Demonstrates expressive switch expressions with stacked multi-case matchers, continue fallthrough, and Python-style list comprehensions.',
  code: `
// Example 33: Switch Statements & List Comprehensions

module DemoSuite {
  export function run() {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
    // 1. Python-style list comprehensions with filtering & mapping
    let evensDoubled = [x * 2 for x in arr if x % 2 == 0]
    println(concat("Evens doubled: ", evensDoubled.join(", ")))

    let squares = [x * x for x in arr if x <= 5]
    println(concat("First five squares: ", squares.join(", ")))

    // 2. Switch expressions (break unnecessary, auto-break without fallthrough by default)
    for (let mut i = 1; i <= 3; i += 1) {
      let word = switch (i) {
        case 1: "One (Solo)"
        case 2: "Two (Pair)"
        case 3: "Three (Trio)"
        default: "Other"
      }
      println(concat(concat("Single Case: ", to_string(i)), concat(" => ", word)))
    }

    // 3. Stacked multiple case matchers in a row
    for (let mut day = 1; day <= 7; day += 1) {
      let dayType = switch (day) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          "Weekday (Work hard)"
        case 6:
        case 7:
          "Weekend (Relax & Code)"
        default:
          "Unknown"
      }
      println(concat(concat("Day ", to_string(day)), concat(" is ", dayType)))
    }

    // 4. Comma-separated matchers
    let tier = switch (95) {
      case 90, 95, 100: "Top Tier (A+)"
      case 80, 85: "High Tier (A)"
      default: "Standard"
    }
    println(concat("Score 95 classification: ", tier))

    // 5. Explicit fallthrough using 'continue'
    println("--- Fallthrough Cascade Demo ---")
    function processSecurityLevel(level: number) {
      switch (level) {
        case 1: {
          println("  [Level 1] High Security Cleared")
          continue
        }
        case 2: {
          println("  [Level 2] Standard Access Cleared")
          continue
        }
        case 3: {
          println("  [Level 3] Basic Access Cleared")
        }
        default: {
          println("  [Default] Guest Access Granted")
        }
      }
    }

    println("Executing Level 1 permissions:")
    processSecurityLevel(1)

    println("Executing Level 2 permissions:")
    processSecurityLevel(2)

    // 6. Rust-style range syntax sugar
    println("--- Rust-Style Range Syntax ---")
    let exclusiveArr = [1..5]
    println(concat("Exclusive [1..5]: ", exclusiveArr.join(", ")))

    let inclusiveArr = [1..=5]
    println(concat("Inclusive [1..=5]: ", inclusiveArr.join(", ")))

    let rangeInComp = [x * 10 for x in 1..=5 if x % 2 != 0]
    println(concat("Range in Comprehension [x * 10 for x in 1..=5 if x % 2 != 0]: ", rangeInComp.join(" ")))
  }
}

DemoSuite.run()
`};
