let arr = [10.0, 20.0, 30.0, 40.0, 50.0];
let mut sum = 0.0;
let mut i = 0.0;
while (i < len(arr)) {
  sum += arr[i];
  i += 1.0;
}
println(concat("Array sum = ", to_string(sum)));
