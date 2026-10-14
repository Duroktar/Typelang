#include "tl_runtime.h"

// --- Function Prototypes ---

// --- Function Implementations ---

// --- Main Entry Point ---
int main(int argc, char** argv) {
  (void)argc; (void)argv;

  tl_println(tl_str("Hello from TypeLang Compiled C11!"));
  TLValue x = tl_add(tl_num(10), tl_num(32));
  tl_println(tl_concat(tl_str("Computed value: "), tl_to_string(x)));
  return 0;
}

