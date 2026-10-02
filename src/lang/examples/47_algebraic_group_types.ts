import { ExampleProgram } from "./types";

export const example47AlgebraicGroupTypes: ExampleProgram = {
  id: 'algebraic_group_types',
  name: '47. Standard Library: Group & Algebraic Types (Monoid, SemiGroup, Setoid, Ord, Functor, Contravariant, Applicative, Validation)',
  category: 'Functional Programming',
  description: 'Demonstrates TypeLang algebraic group types: Setoid, Ord, Semigroup/SemiGroup, Monoid, Group, Functor, Contravariant, Applicative, Validation, Bifunctor, Profunctor, and Foldable.',
  code: `// TypeLang Standard Library: Algebraic Group Types Showcase
// Demonstrating Setoid, Ord, Semigroup/SemiGroup, Monoid, Group, Functor, Contravariant, Applicative, Validation, Bifunctor, Profunctor, Foldable

import Setoid.{ equals, notEquals, fromEquals }
import Ord.{ compare, min, max, clamp, between, Less, Equal, Greater }
import Semigroup.{ combine, concatAll }
import SemiGroup.{ combine as sgCombine }
import Monoid.{ Sum, Product, String as StrMonoid, All, Any }
import Group.{ invert, subtract }
import Functor.{ map, lift, as }
import Contravariant.{ contramap }
import Applicative.{ pure, ap, lift2 }
import Validation.{ Valid, Invalid, accumulate }
import Bifunctor.{ bimap }
import Profunctor.{ dimap }
import Foldable.{ foldLeft, foldMap }

println("=== 1. Setoid Module (Equivalence Relations) ===")
let arr1 = [10, 20, 30]
let arr2 = [10, 20, 30]
println(concat("Array equivalence (Setoid.equals): ", to_string(Setoid.equals(arr1, arr2))))
println(concat("Inequality check (Setoid.notEquals): ", to_string(Setoid.notEquals("a", "b"))))

println("\\n=== 2. Ord Module (Total Ordering & Comparison) ===")
let clampedVal = Ord.clamp(150, 0, 100)
println(concat("Ord.clamp(150, 0, 100) = ", to_string(clampedVal)))
println(concat("Ord.between(50, 0, 100) = ", to_string(Ord.between(50, 0, 100))))
let minVal = Ord.min(42, 18)
println(concat("Ord.min(42, 18) = ", to_string(minVal)))

println("\\n=== 3. Semigroup & SemiGroup Modules (Associative Combination) ===")
let mergedList = Semigroup.concatAll(["Type", "Lang", " ", "Algebraic", " ", "Group"], "")
println(concat("Semigroup.concatAll: ", mergedList))
let sgMerged = sgCombine(100, 250)
println(concat("SemiGroup.combine(100, 250) = ", to_string(sgMerged)))

println("\\n=== 4. Monoid Module (Semigroup with Identity) ===")
let numList: Array<number> = [1, 2, 3, 4]
let monoidSum = Monoid.concatAll(numList, 0)
println(concat("Monoid sum accumulation [1..5]: ", to_string(monoidSum)))
let allTrue = Monoid.All.combine(true, true)
println(concat("Monoid.All.combine(true, true): ", to_string(allTrue)))

println("\\n=== 5. Group Module (Monoid + Invert / Subtract) ===")
let invVal = Group.invert(42)
println(concat("Group.invert(42) = ", to_string(invVal)))
let subVal = Group.subtract(100, 35)
println(concat("Group.subtract(100, 35) = ", to_string(subVal)))

println("\\n=== 6. Functor & Contravariant Modules ===")
let functorMapped = Functor.map(Some(10), (x: number) => x * 3)
println(concat("Functor.map(Some(10), x * 3) = ", to_string(Option.getOrElse(functorMapped, 0))))

let isEvenPred = (n: number) => n % 2 == 0
let isEvenUserAge = Contravariant.contramap(isEvenPred, (u: { age: number }) => u.age)
let sampleUser = { age: 30 }
println(concat("Contravariant user age check: ", to_string(isEvenUserAge(sampleUser))))

println("\\n=== 7. Applicative & Validation (Error Accumulating Applicative) ===")
let appSum = Applicative.lift2((x: number, y: number) => x + y, Some(15), Some(27))
println(concat("Applicative.lift2(+, Some(15), Some(27)) = ", to_string(Option.getOrElse(appSum, 0))))

type UserProfile = { name: string, age: number }
let v1: Validation<string> = Valid("Alice")
let v2: Validation<number> = Valid(28)
let validProfile = Validation.accumulate(v1, v2, (name: string, age: number) => { name: name, age: age })
println(concat("Validation result valid: ", to_string(Validation.isValid(validProfile))))

println("\\n=== 8. Bifunctor, Profunctor, Foldable ===")
let okRes: Result<number, string> = Ok(20)
let mappedBifunctor = Bifunctor.bimap(okRes, (err: string) => concat("ERR: ", err), (v: number) => v * 5)
match (mappedBifunctor) {
  Ok(v) => println(concat("Bifunctor Ok mapped value: ", to_string(v)))
  Err(e) => println(concat("Bifunctor Err: ", e))
}

let sumFolded = Foldable.foldLeft(numList, 0, (acc: number, x: number) => acc + x)
println(concat("Foldable.foldLeft sum: ", to_string(sumFolded)))
`
};
