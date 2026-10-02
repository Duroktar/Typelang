import { ExampleProgram } from "./types";

export const example44MonadsDoWhere: ExampleProgram = {
  id: 'monads_do_where',
  name: '44. Monadic Do-Notation & Where Clauses',
  category: 'Functional Programming',
  description: 'First-class monadic do-notation desugaring with bind (`<-`), pure, let bindings, and scoped `where` blocks on functions and expressions.',
  code: `// TypeLang Monadic Do-Notation & Where Scoping Lab
// Showcasing syntactic elegance for monadic workflows and local definitions

// 1. Algebraic Data Type for Option / Maybe Monad
type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>

// 2. Monadic primitives: flatMap and pure
function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
  match (opt) {
    Some(v) => f(v)
    None => None
  }
}

function pure<a>(val: a): Option<a> {
  Some(val)
}

// 3. User Database & Query Lookup Helpers
type User = { id: number, name: string, balance: number }

function findUser(id: number): Option<User> {
  if (id == 1) {
    Some({ id: 1, name: "Alice", balance: 150 })
  } else if (id == 2) {
    Some({ id: 2, name: "Bob", balance: 80 })
  } else {
    None
  }
}

function validateFunds(user: User, cost: number): Option<number> {
  if (user.balance >= cost) {
    Some(user.balance - cost)
  } else {
    None
  }
}

// 4. Monadic computation sequenced cleanly with 'do' notation
function purchaseItem(userId: number, cost: number): Option<string> {
  do {
    user <- findUser(userId);
    let taxRate = 0.08;
    let totalCost = cost * (1 + taxRate);
    remaining <- validateFunds(user, totalCost);
    pure formatReceipt(user.name, totalCost, remaining);
  }
} where {
  // Scoped helper functions & constants using 'where' block
  function formatReceipt(name: string, spent: number, rem: number): string {
    concat(name, concat(" purchased item! Total with tax: $", concat(to_string(spent), concat(". Remaining balance: $", to_string(rem)))))
  }
}

// 5. Mathematical computation using expression-level 'where' clause
let orbitalVelocity = sqrt(gravitationalParameter / orbitalRadius) where {
  let gravitationalParameter = 398600.4418 // km^3/s^2 for Earth
  let orbitalRadius = 6371 + 400 // km for ISS orbit
  function sqrt(x: number): number {
    Math.sqrt(x)
  }
}

// 6. Run transactions and report results
println("=== Monadic Do-Notation & Where Showcase ===")

let tx1 = purchaseItem(1, 50)
match (tx1) {
  Some(receipt) => println(concat("Transaction 1 Succeeded: ", receipt))
  None => println("Transaction 1 Failed: Insufficient funds or user not found.")
}

let tx2 = purchaseItem(2, 100)
match (tx2) {
  Some(receipt) => println(concat("Transaction 2 Succeeded: ", receipt))
  None => println("Transaction 2 Failed: Insufficient funds or user not found.")
}

println(concat("Calculated LEO Orbital Velocity: ", concat(to_string(orbitalVelocity), " m/s")))
`
};
