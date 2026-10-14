#ifndef TL_RUNTIME_H
#define TL_RUNTIME_H

#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <math.h>

#ifdef __cplusplus
extern "C" {
#endif

// ============================================================================
// TypeLang Portable C11 / C99 Standalone Runtime Header
// Zero external dependencies. Works on GCC, Clang, MSVC, and TCC.
// ============================================================================

typedef enum {
  TL_NULL = 0,
  TL_NUM = 1,
  TL_BOOL = 2,
  TL_STR = 3,
  TL_ARR = 4,
  TL_VARIANT = 5,
  TL_FN = 6
} TLValueKind;

typedef struct TLValue TLValue;
typedef TLValue (*TLNativeFn)(size_t argc, const TLValue* argv);

typedef struct {
  size_t len;
  size_t cap;
  TLValue* items;
} TLArray;

typedef struct {
  char* ctor;
  size_t argc;
  TLValue* args;
} TLVariant;

struct TLValue {
  TLValueKind kind;
  union {
    double num;
    bool boolean;
    char* str;
    TLArray* arr;
    TLVariant* variant;
    TLNativeFn fn;
  } u;
};

// --- Value Constructors ---

static inline TLValue tl_null(void) {
  TLValue v;
  v.kind = TL_NULL;
  v.u.num = 0.0;
  return v;
}

static inline TLValue tl_num(double n) {
  TLValue v;
  v.kind = TL_NUM;
  v.u.num = n;
  return v;
}

static inline TLValue tl_bool(bool b) {
  TLValue v;
  v.kind = TL_BOOL;
  v.u.boolean = b;
  return v;
}

static inline TLValue tl_str(const char* s) {
  TLValue v;
  v.kind = TL_STR;
  if (!s) {
    v.u.str = (char*)calloc(1, sizeof(char));
  } else {
    size_t len = strlen(s);
    v.u.str = (char*)malloc(len + 1);
    if (v.u.str) {
      memcpy(v.u.str, s, len + 1);
    }
  }
  return v;
}

static inline TLValue tl_array_new(size_t initial_cap) {
  TLValue v;
  v.kind = TL_ARR;
  v.u.arr = (TLArray*)malloc(sizeof(TLArray));
  if (initial_cap < 4) initial_cap = 4;
  v.u.arr->len = 0;
  v.u.arr->cap = initial_cap;
  v.u.arr->items = (TLValue*)malloc(sizeof(TLValue) * initial_cap);
  return v;
}

static inline TLValue tl_array(size_t len, const TLValue* items) {
  TLValue v = tl_array_new(len > 4 ? len : 4);
  v.u.arr->len = len;
  if (items && len > 0) {
    memcpy(v.u.arr->items, items, sizeof(TLValue) * len);
  }
  return v;
}

static inline TLValue tl_variant(const char* ctor, size_t argc, const TLValue* args) {
  TLValue v;
  v.kind = TL_VARIANT;
  v.u.variant = (TLVariant*)malloc(sizeof(TLVariant));
  size_t ctor_len = ctor ? strlen(ctor) : 0;
  v.u.variant->ctor = (char*)malloc(ctor_len + 1);
  if (ctor) memcpy(v.u.variant->ctor, ctor, ctor_len + 1);
  else v.u.variant->ctor[0] = '\0';
  v.u.variant->argc = argc;
  if (argc > 0 && args) {
    v.u.variant->args = (TLValue*)malloc(sizeof(TLValue) * argc);
    memcpy(v.u.variant->args, args, sizeof(TLValue) * argc);
  } else {
    v.u.variant->args = NULL;
  }
  return v;
}

static inline TLValue tl_fn(TLNativeFn fn) {
  TLValue v;
  v.kind = TL_FN;
  v.u.fn = fn;
  return v;
}

// --- Truthiness & Type Checks ---

static inline bool tl_is_truthy(TLValue v) {
  switch (v.kind) {
    case TL_NULL: return false;
    case TL_BOOL: return v.u.boolean;
    case TL_NUM: return v.u.num != 0.0 && !isnan(v.u.num);
    case TL_STR: return v.u.str != NULL && v.u.str[0] != '\0';
    case TL_ARR: return v.u.arr != NULL && v.u.arr->len > 0;
    case TL_VARIANT: return true;
    case TL_FN: return v.u.fn != NULL;
    default: return false;
  }
}

// --- Arithmetic Operations ---

static inline TLValue tl_add(TLValue a, TLValue b) {
  if (a.kind == TL_NUM && b.kind == TL_NUM) {
    return tl_num(a.u.num + b.u.num);
  }
  // String concatenation fallback
  if (a.kind == TL_STR || b.kind == TL_STR) {
    char buf_a[64];
    char buf_b[64];
    const char* sa = (a.kind == TL_STR && a.u.str) ? a.u.str : (snprintf(buf_a, sizeof(buf_a), "%g", a.u.num), buf_a);
    const char* sb = (b.kind == TL_STR && b.u.str) ? b.u.str : (snprintf(buf_b, sizeof(buf_b), "%g", b.u.num), buf_b);
    size_t la = strlen(sa);
    size_t lb = strlen(sb);
    char* res = (char*)malloc(la + lb + 1);
    memcpy(res, sa, la);
    memcpy(res + la, sb, lb + 1);
    TLValue out;
    out.kind = TL_STR;
    out.u.str = res;
    return out;
  }
  return tl_num(0.0);
}

static inline TLValue tl_sub(TLValue a, TLValue b) {
  return tl_num((a.kind == TL_NUM ? a.u.num : 0.0) - (b.kind == TL_NUM ? b.u.num : 0.0));
}

static inline TLValue tl_mul(TLValue a, TLValue b) {
  return tl_num((a.kind == TL_NUM ? a.u.num : 0.0) * (b.kind == TL_NUM ? b.u.num : 0.0));
}

static inline TLValue tl_div(TLValue a, TLValue b) {
  double denom = (b.kind == TL_NUM ? b.u.num : 0.0);
  if (denom == 0.0) return tl_num(0.0);
  return tl_num((a.kind == TL_NUM ? a.u.num : 0.0) / denom);
}

static inline TLValue tl_mod(TLValue a, TLValue b) {
  double num = (a.kind == TL_NUM ? a.u.num : 0.0);
  double den = (b.kind == TL_NUM ? b.u.num : 1.0);
  if (den == 0.0) return tl_num(0.0);
  return tl_num(fmod(num, den));
}

static inline TLValue tl_neg(TLValue a) {
  return tl_num(-(a.kind == TL_NUM ? a.u.num : 0.0));
}

// --- Comparison Operations ---

static inline TLValue tl_eq(TLValue a, TLValue b) {
  if (a.kind != b.kind) {
    if (a.kind == TL_NULL && b.kind == TL_NULL) return tl_bool(true);
    return tl_bool(false);
  }
  switch (a.kind) {
    case TL_NULL: return tl_bool(true);
    case TL_BOOL: return tl_bool(a.u.boolean == b.u.boolean);
    case TL_NUM: return tl_bool(a.u.num == b.u.num);
    case TL_STR: return tl_bool(strcmp(a.u.str ? a.u.str : "", b.u.str ? b.u.str : "") == 0);
    case TL_VARIANT: {
      if (strcmp(a.u.variant->ctor, b.u.variant->ctor) != 0) return tl_bool(false);
      if (a.u.variant->argc != b.u.variant->argc) return tl_bool(false);
      for (size_t i = 0; i < a.u.variant->argc; ++i) {
        TLValue eq = tl_eq(a.u.variant->args[i], b.u.variant->args[i]);
        if (!eq.u.boolean) return tl_bool(false);
      }
      return tl_bool(true);
    }
    default: return tl_bool(false);
  }
}

static inline TLValue tl_neq(TLValue a, TLValue b) {
  TLValue eq = tl_eq(a, b);
  return tl_bool(!eq.u.boolean);
}

static inline TLValue tl_lt(TLValue a, TLValue b) {
  if (a.kind == TL_NUM && b.kind == TL_NUM) return tl_bool(a.u.num < b.u.num);
  if (a.kind == TL_STR && b.kind == TL_STR) return tl_bool(strcmp(a.u.str, b.u.str) < 0);
  return tl_bool(false);
}

static inline TLValue tl_lte(TLValue a, TLValue b) {
  if (a.kind == TL_NUM && b.kind == TL_NUM) return tl_bool(a.u.num <= b.u.num);
  if (a.kind == TL_STR && b.kind == TL_STR) return tl_bool(strcmp(a.u.str, b.u.str) <= 0);
  return tl_bool(false);
}

static inline TLValue tl_gt(TLValue a, TLValue b) {
  if (a.kind == TL_NUM && b.kind == TL_NUM) return tl_bool(a.u.num > b.u.num);
  if (a.kind == TL_STR && b.kind == TL_STR) return tl_bool(strcmp(a.u.str, b.u.str) > 0);
  return tl_bool(false);
}

static inline TLValue tl_gte(TLValue a, TLValue b) {
  if (a.kind == TL_NUM && b.kind == TL_NUM) return tl_bool(a.u.num >= b.u.num);
  if (a.kind == TL_STR && b.kind == TL_STR) return tl_bool(strcmp(a.u.str, b.u.str) >= 0);
  return tl_bool(false);
}

static inline TLValue tl_not(TLValue a) {
  return tl_bool(!tl_is_truthy(a));
}

// --- String Functions ---

static inline TLValue tl_concat(TLValue a, TLValue b) {
  return tl_add(a, b);
}

static inline TLValue concat(TLValue a, TLValue b) {
  return tl_concat(a, b);
}

static inline TLValue tl_to_string(TLValue v) {
  char buf[128];
  switch (v.kind) {
    case TL_NULL: return tl_str("null");
    case TL_BOOL: return tl_str(v.u.boolean ? "true" : "false");
    case TL_NUM: {
      if (floor(v.u.num) == v.u.num && fabs(v.u.num) < 1e15) {
        snprintf(buf, sizeof(buf), "%lld", (long long)v.u.num);
      } else {
        snprintf(buf, sizeof(buf), "%g", v.u.num);
      }
      return tl_str(buf);
    }
    case TL_STR: return tl_str(v.u.str ? v.u.str : "");
    case TL_VARIANT: {
      char out[256];
      snprintf(out, sizeof(out), "%s(...)", v.u.variant ? v.u.variant->ctor : "Variant");
      return tl_str(out);
    }
    default: return tl_str("[Value]");
  }
}

static inline TLValue to_string(TLValue v) {
  return tl_to_string(v);
}

static inline TLValue tl_len(TLValue v) {
  if (v.kind == TL_STR && v.u.str) {
    return tl_num((double)strlen(v.u.str));
  }
  if (v.kind == TL_ARR && v.u.arr) {
    return tl_num((double)v.u.arr->len);
  }
  return tl_num(0.0);
}

static inline TLValue len(TLValue v) {
  return tl_len(v);
}

static inline TLValue tl_char_code_at(TLValue str, TLValue idx) {
  if (str.kind != TL_STR || !str.u.str) return tl_num(0.0);
  int i = (int)(idx.kind == TL_NUM ? idx.u.num : 0);
  size_t len = strlen(str.u.str);
  if (i < 0 || (size_t)i >= len) return tl_num(0.0);
  return tl_num((double)(unsigned char)str.u.str[i]);
}

static inline TLValue tl_str_char_at(TLValue str, TLValue idx) {
  if (str.kind != TL_STR || !str.u.str) return tl_str("");
  int i = (int)(idx.kind == TL_NUM ? idx.u.num : 0);
  size_t len = strlen(str.u.str);
  if (i < 0 || (size_t)i >= len) return tl_str("");
  char c[2] = { str.u.str[i], '\0' };
  return tl_str(c);
}

static inline TLValue tl_str_slice(TLValue str, TLValue start, TLValue end) {
  if (str.kind != TL_STR || !str.u.str) return tl_str("");
  size_t len = strlen(str.u.str);
  int s = (int)(start.kind == TL_NUM ? start.u.num : 0);
  int e = (int)(end.kind == TL_NUM ? end.u.num : (double)len);
  if (s < 0) s = 0;
  if ((size_t)s > len) s = (int)len;
  if (e < s) e = s;
  if ((size_t)e > len) e = (int)len;
  size_t slice_len = (size_t)(e - s);
  char* out = (char*)malloc(slice_len + 1);
  if (slice_len > 0) {
    memcpy(out, str.u.str + s, slice_len);
  }
  out[slice_len] = '\0';
  TLValue res;
  res.kind = TL_STR;
  res.u.str = out;
  return res;
}

// --- Array Operations ---

static inline TLValue tl_array_get(TLValue arr, TLValue idx) {
  if (arr.kind != TL_ARR || !arr.u.arr) return tl_null();
  int i = (int)(idx.kind == TL_NUM ? idx.u.num : 0);
  if (i < 0 || (size_t)i >= arr.u.arr->len) return tl_null();
  return arr.u.arr->items[i];
}

static inline TLValue tl_array_set(TLValue arr, TLValue idx, TLValue item) {
  if (arr.kind != TL_ARR || !arr.u.arr) return tl_null();
  int i = (int)(idx.kind == TL_NUM ? idx.u.num : 0);
  if (i >= 0 && (size_t)i < arr.u.arr->len) {
    arr.u.arr->items[i] = item;
  }
  return item;
}

static inline TLValue tl_array_push(TLValue arr, TLValue item) {
  if (arr.kind != TL_ARR || !arr.u.arr) return arr;
  TLArray* a = arr.u.arr;
  if (a->len >= a->cap) {
    size_t new_cap = a->cap * 2;
    if (new_cap < 8) new_cap = 8;
    TLValue* new_items = (TLValue*)realloc(a->items, sizeof(TLValue) * new_cap);
    if (new_items) {
      a->items = new_items;
      a->cap = new_cap;
    }
  }
  if (a->len < a->cap) {
    a->items[a->len++] = item;
  }
  return arr;
}

// --- Variant Operations (Pattern Matching) ---

static inline TLValue tl_get_variant_ctor(TLValue v) {
  if (v.kind != TL_VARIANT || !v.u.variant || !v.u.variant->ctor) return tl_str("");
  return tl_str(v.u.variant->ctor);
}

static inline TLValue tl_get_variant_arg(TLValue v, TLValue idx) {
  if (v.kind != TL_VARIANT || !v.u.variant) return tl_null();
  size_t i = (size_t)(idx.kind == TL_NUM ? idx.u.num : 0);
  if (i >= v.u.variant->argc) return tl_null();
  return v.u.variant->args[i];
}

// --- Standard I/O & File Operations ---

static inline TLValue tl_print(TLValue v) {
  TLValue s = tl_to_string(v);
  if (s.u.str) fputs(s.u.str, stdout);
  return tl_null();
}

static inline TLValue tl_println(TLValue v) {
  TLValue s = tl_to_string(v);
  if (s.u.str) {
    fputs(s.u.str, stdout);
    fputc('\n', stdout);
  } else {
    fputc('\n', stdout);
  }
  fflush(stdout);
  return tl_null();
}

static inline TLValue println(TLValue v) {
  return tl_println(v);
}

static inline TLValue print(TLValue v) {
  return tl_print(v);
}

static inline TLValue tl_read_file(TLValue path) {
  if (path.kind != TL_STR || !path.u.str) return tl_null();
  FILE* f = fopen(path.u.str, "rb");
  if (!f) return tl_null();
  fseek(f, 0, SEEK_END);
  long len = ftell(f);
  fseek(f, 0, SEEK_SET);
  if (len < 0) {
    fclose(f);
    return tl_null();
  }
  char* buf = (char*)malloc(len + 1);
  if (!buf) {
    fclose(f);
    return tl_null();
  }
  size_t read_bytes = fread(buf, 1, len, f);
  buf[read_bytes] = '\0';
  fclose(f);
  TLValue res;
  res.kind = TL_STR;
  res.u.str = buf;
  return res;
}

static inline TLValue tl_write_file(TLValue path, TLValue content) {
  if (path.kind != TL_STR || !path.u.str) return tl_bool(false);
  const char* text = (content.kind == TL_STR && content.u.str) ? content.u.str : "";
  FILE* f = fopen(path.u.str, "wb");
  if (!f) return tl_bool(false);
  fputs(text, f);
  fclose(f);
  return tl_bool(true);
}

// Global CLI arguments
static int _tl_argc = 0;
static char** _tl_argv = NULL;

static inline TLValue tl_get_cli_arg(TLValue idx) {
  int i = (int)(idx.kind == TL_NUM ? idx.u.num : 0);
  if (i >= 0 && i < _tl_argc && _tl_argv && _tl_argv[i]) {
    return tl_str(_tl_argv[i]);
  }
  return tl_str("");
}

static inline TLValue get_cli_arg(TLValue idx) {
  return tl_get_cli_arg(idx);
}

static inline TLValue read_file(TLValue path) {
  return tl_read_file(path);
}

static inline TLValue write_file(TLValue path, TLValue content) {
  return tl_write_file(path, content);
}

static inline TLValue String_len(TLValue str) {
  return tl_len(str);
}

static inline TLValue String_charAt(TLValue str, TLValue idx) {
  return tl_str_slice(str, idx, tl_add(idx, tl_num(1.0)));
}

static inline TLValue String_slice(TLValue str, TLValue start, TLValue end) {
  return tl_str_slice(str, start, end);
}

static inline TLValue String_substring(TLValue str, TLValue start, TLValue end) {
  return tl_str_slice(str, start, end);
}

static inline TLValue String_contains(TLValue str, TLValue substr) {
  if (str.kind != TL_STR || !str.u.str || substr.kind != TL_STR || !substr.u.str) {
    return tl_bool(false);
  }
  return tl_bool(strstr(str.u.str, substr.u.str) != NULL);
}

static inline TLValue String_parseFloat(TLValue str) {
  if (str.kind == TL_STR && str.u.str) {
    return tl_num(atof(str.u.str));
  }
  return tl_num(0.0);
}

static inline TLValue String_parseInt(TLValue str) {
  if (str.kind == TL_STR && str.u.str) {
    return tl_num((double)atol(str.u.str));
  }
  return tl_num(0.0);
}

static inline TLValue Array_len(TLValue arr) {
  return tl_len(arr);
}

static inline TLValue Array_push(TLValue arr, TLValue item) {
  return tl_array_push(arr, item);
}

#ifdef __cplusplus
}
#endif

#endif // TL_RUNTIME_H

