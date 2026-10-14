function fib(n: number): number {
  if (n <= 1.0) {
    return n;
  } else {
    return fib(n - 1.0) + fib(n - 2.0);
  }
}

let result = fib(10.0);
println(concat("fib(10) = ", to_string(result)));
