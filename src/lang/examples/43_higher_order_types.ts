import { ExampleProgram } from "./types";

export const example43HigherOrderTypes: ExampleProgram = {
  id: 'higher_order_types',
  name: '43. Higher-Order Types & HKTs',
  category: 'Type System',
  description: 'Higher-Order Types (HKTs), type constructor variables (F: * -> *), Functor/Monad abstractions, and type lambdas.',
  code: `// TypeLang Higher-Order Types (HOTs / Higher-Kinded Types)
// Quantify over type constructors of higher kind: F: * -> *

// 1. Generic higher-kinded Functor record interface
type Functor<F: * -> *> = {
  map: <A, B>(fa: F<A>, f: (x: A) => B) => F<B>
}

// 2. Generic higher-kinded Monad record interface
type Monad<M: * -> *> = {
  pure: <A>(val: A) => M<A>,
  flatMap: <A, B>(ma: M<A>, f: (x: A) => M<B>) => M<B>
}

// 3. Concrete Algebraic Data Types (Kind: *)
type Option<T> =
  | Some(val: T)
  | None

type List<T> =
  | Cons(head: T, tail: List<T>)
  | Nil

// 4. Implement Functor instance for Option (Option has kind * -> *)
let optionFunctor: Functor<Option> = {
  map: <A, B>(opt: Option<A>, f: (x: A) => B): Option<B> => {
    match (opt) {
      Some(v) => Some(f(v))
      None => None
    }
  }
}

// 5. Implement Monad instance for Option
let optionMonad: Monad<Option> = {
  pure: <A>(val: A): Option<A> => Some(val),
  flatMap: <A, B>(ma: Option<A>, f: (x: A) => Option<B>): Option<B> => {
    match (ma) {
      Some(v) => f(v)
      None => None
    }
  }
}

// 6. Generic Higher-Order Pipeline Function using HKTs
function transformTwice<F: * -> *, A>(functor: Functor<F>, container: F<A>, f1: (x: A) => A, f2: (x: A) => A): F<A> {
  let step1 = functor.map(container, f1)
  functor.map(step1, f2)
}

// 7. Type-level Lambdas (\T => Option<T>) and higher-order computations
let numOpt: Option<number> = Some(21)
let doubled = transformTwice(optionFunctor, numOpt, fn(x: number) => x * 2, fn(x: number) => x + 10)

match (doubled) {
  Some(result) => println(concat("HKT Functor Transform Result: ", to_string(result)))
  None => println("None")
}

// 8. Monadic Composition with HKTs
let compute = optionMonad.flatMap(Some(50), fn(a: number) => {
  optionMonad.flatMap(Some(25), fn(b: number) => {
    optionMonad.pure(a + b)
  })
})

match (compute) {
  Some(sum) => println(concat("Monadic HKT Result: ", to_string(sum)))
  None => println("Monad failed")
}
`
};
