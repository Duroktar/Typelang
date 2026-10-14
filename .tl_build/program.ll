; =====================================================================
; Module: TypeLang Generated LLVM SSA Target
; Architecture: x86_64-unknown-linux-gnu / POSIX
; =====================================================================
; ModuleID = "typelang_module"
source_filename = "main.tl"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

; --- Core Data Struct Layouts ---
%struct.GADTValue = type { i32, i8* }     ; Tagged union (tag: i32, payload: i8*)
%struct.Array = type { i64, i8** }        ; Dynamic array (len: i64, data: i8**)
%struct.RecordField = type { i8*, i8* }   ; Structural dynamic field slot

; --- Standard Formats & String Constants ---
@.fmt_str = private unnamed_addr constant [4 x i8] c"%s\0A\00", align 1
@.fmt_num = private unnamed_addr constant [4 x i8] c"%f\0A\00", align 1
@.fmt_int = private unnamed_addr constant [6 x i8] c"%lld\0A\00", align 1
@.fmt_bool_t = private unnamed_addr constant [6 x i8] c"true\0A\00", align 1
@.fmt_bool_f = private unnamed_addr constant [7 x i8] c"false\0A\00", align 1
@.fmt_tostr_str = private unnamed_addr constant [3 x i8] c"%s\00", align 1
@.fmt_tostr_num = private unnamed_addr constant [5 x i8] c"%.14g\00", align 1
@.fmt_tostr_int = private unnamed_addr constant [5 x i8] c"%lld\00", align 1
@.fmt_bool_t_val = private unnamed_addr constant [5 x i8] c"true\00", align 1
@.fmt_bool_f_val = private unnamed_addr constant [6 x i8] c"false\00", align 1

; --- Interned String Literals ---
@.str.0 = private unnamed_addr constant [12 x i8] c"Greetings, \00", align 1
@.str.1 = private unnamed_addr constant [13 x i8] c"Large Circle\00", align 1
@.str.2 = private unnamed_addr constant [13 x i8] c"Small Circle\00", align 1
@.str.3 = private unnamed_addr constant [10 x i8] c"Rectangle\00", align 1
@.str.4 = private unnamed_addr constant [40 x i8] c"=== TYPELANG NATIVE BOOTSTRAP SUITE ===\00", align 1
@.str.5 = private unnamed_addr constant [34 x i8] c"[TEST 1: PRIMITIVES & ARITHMETIC]\00", align 1
@.str.6 = private unnamed_addr constant [6 x i8] c"int: \00", align 1
@.str.7 = private unnamed_addr constant [8 x i8] c"float: \00", align 1
@.str.8 = private unnamed_addr constant [6 x i8] c"neg: \00", align 1
@.str.9 = private unnamed_addr constant [7 x i8] c"bool: \00", align 1
@.str.10 = private unnamed_addr constant [3 x i8] c", \00", align 1
@.str.11 = private unnamed_addr constant [8 x i8] c"arith: \00", align 1
@.str.12 = private unnamed_addr constant [6 x i8] c"mod: \00", align 1
@.str.13 = private unnamed_addr constant [13 x i8] c"precedence: \00", align 1
@.str.14 = private unnamed_addr constant [34 x i8] c"[TEST 2: STRINGS & CONCATENATION]\00", align 1
@.str.15 = private unnamed_addr constant [32 x i8] c"escaped: Line 1\5CnLine 2\5CtTabbed\00", align 1
@.str.16 = private unnamed_addr constant [8 x i8] c"Hello, \00", align 1
@.str.17 = private unnamed_addr constant [23 x i8] c"TypeLang Native World!\00", align 1
@.str.18 = private unnamed_addr constant [9 x i8] c"concat: \00", align 1
@.str.19 = private unnamed_addr constant [33 x i8] c"[TEST 3: VARIABLES & MUTABILITY]\00", align 1
@.str.20 = private unnamed_addr constant [11 x i8] c"reassign: \00", align 1
@.str.21 = private unnamed_addr constant [18 x i8] c"shadowing: inner=\00", align 1
@.str.22 = private unnamed_addr constant [9 x i8] c", outer=\00", align 1
@.str.23 = private unnamed_addr constant [13 x i8] c"block_expr: \00", align 1
@.str.24 = private unnamed_addr constant [32 x i8] c"[TEST 4: FUNCTIONS & RECURSION]\00", align 1
@.str.25 = private unnamed_addr constant [6 x i8] c"add: \00", align 1
@.str.26 = private unnamed_addr constant [15 x i8] c"factorial(6): \00", align 1
@.str.27 = private unnamed_addr constant [16 x i8] c"fibonacci(10): \00", align 1
@.str.28 = private unnamed_addr constant [17 x i8] c"mutual_even(8): \00", align 1
@.str.29 = private unnamed_addr constant [16 x i8] c"mutual_odd(8): \00", align 1
@.str.30 = private unnamed_addr constant [15 x i8] c"early_return: \00", align 1
@.str.31 = private unnamed_addr constant [43 x i8] c"[TEST 5: FIRST-CLASS FUNCTIONS & CLOSURES]\00", align 1
@.str.32 = private unnamed_addr constant [16 x i8] c"lambda_square: \00", align 1
@.str.33 = private unnamed_addr constant [21 x i8] c"higher_order_apply: \00", align 1
@.str.34 = private unnamed_addr constant [16 x i8] c"closure_adder: \00", align 1
@.str.35 = private unnamed_addr constant [31 x i8] c"[TEST 6: CONTROL FLOW & LOOPS]\00", align 1
@.str.36 = private unnamed_addr constant [9 x i8] c"positive\00", align 1
@.str.37 = private unnamed_addr constant [13 x i8] c"non-positive\00", align 1
@.str.38 = private unnamed_addr constant [12 x i8] c"if_branch: \00", align 1
@.str.39 = private unnamed_addr constant [5 x i8] c"pass\00", align 1
@.str.40 = private unnamed_addr constant [5 x i8] c"fail\00", align 1
@.str.41 = private unnamed_addr constant [10 x i8] c"ternary: \00", align 1
@.str.42 = private unnamed_addr constant [17 x i8] c"while_loop: sum=\00", align 1
@.str.43 = private unnamed_addr constant [23 x i8] c"while_break_continue: \00", align 1
@.str.44 = private unnamed_addr constant [17 x i8] c"for_loop: total=\00", align 1
@.str.45 = private unnamed_addr constant [21 x i8] c"nested_loops: cells=\00", align 1
@.str.46 = private unnamed_addr constant [7 x i8] c"Monday\00", align 1
@.str.47 = private unnamed_addr constant [8 x i8] c"Tuesday\00", align 1
@.str.48 = private unnamed_addr constant [10 x i8] c"Wednesday\00", align 1
@.str.49 = private unnamed_addr constant [6 x i8] c"Other\00", align 1
@.str.50 = private unnamed_addr constant [14 x i8] c"switch_case: \00", align 1
@.str.51 = private unnamed_addr constant [29 x i8] c"[TEST 7: STRUCTURAL RECORDS]\00", align 1
@.str.52 = private unnamed_addr constant [2 x i8] c"x\00", align 1
@.str.53 = private unnamed_addr constant [2 x i8] c"y\00", align 1
@.str.54 = private unnamed_addr constant [10 x i8] c"point: x=\00", align 1
@.str.55 = private unnamed_addr constant [5 x i8] c", y=\00", align 1
@.str.56 = private unnamed_addr constant [7 x i8] c"server\00", align 1
@.str.57 = private unnamed_addr constant [5 x i8] c"host\00", align 1
@.str.58 = private unnamed_addr constant [10 x i8] c"localhost\00", align 1
@.str.59 = private unnamed_addr constant [5 x i8] c"port\00", align 1
@.str.60 = private unnamed_addr constant [21 x i8] c"nested_record: host=\00", align 1
@.str.61 = private unnamed_addr constant [8 x i8] c", port=\00", align 1
@.str.62 = private unnamed_addr constant [20 x i8] c"record_update: old=\00", align 1
@.str.63 = private unnamed_addr constant [11 x i8] c", updated=\00", align 1
@.str.64 = private unnamed_addr constant [26 x i8] c"[TEST 8: TUPLES & ARRAYS]\00", align 1
@.str.65 = private unnamed_addr constant [7 x i8] c"Centum\00", align 1
@.str.66 = private unnamed_addr constant [20 x i8] c"tuple_items: first=\00", align 1
@.str.67 = private unnamed_addr constant [10 x i8] c", second=\00", align 1
@.str.68 = private unnamed_addr constant [20 x i8] c"tuple_return: quot=\00", align 1
@.str.69 = private unnamed_addr constant [7 x i8] c", rem=\00", align 1
@.str.70 = private unnamed_addr constant [14 x i8] c"array_index: \00", align 1
@.str.71 = private unnamed_addr constant [39 x i8] c"[TEST 9: ALGEBRAIC DATA TYPES & GADTS]\00", align 1
@.str.72 = private unnamed_addr constant [4 x i8] c"Red\00", align 1
@.str.73 = private unnamed_addr constant [6 x i8] c"Green\00", align 1
@.str.74 = private unnamed_addr constant [5 x i8] c"Blue\00", align 1
@.str.75 = private unnamed_addr constant [7 x i8] c"enum: \00", align 1
@.str.76 = private unnamed_addr constant [8 x i8] c"maybe: \00", align 1
@.str.77 = private unnamed_addr constant [11 x i8] c"list_sum: \00", align 1
@.str.78 = private unnamed_addr constant [12 x i8] c"gadt_eval: \00", align 1
@.str.79 = private unnamed_addr constant [28 x i8] c"[TEST 10: PATTERN MATCHING]\00", align 1
@.str.80 = private unnamed_addr constant [4 x i8] c"One\00", align 1
@.str.81 = private unnamed_addr constant [4 x i8] c"Two\00", align 1
@.str.82 = private unnamed_addr constant [16 x i8] c"literal_match: \00", align 1
@.str.83 = private unnamed_addr constant [21 x i8] c"constructor_unwrap: \00", align 1
@.str.84 = private unnamed_addr constant [17 x i8] c"multi_arg_ctor: \00", align 1
@.str.85 = private unnamed_addr constant [14 x i8] c"guard_match: \00", align 1
@.str.86 = private unnamed_addr constant [16 x i8] c"tuple_pattern: \00", align 1
@.str.87 = private unnamed_addr constant [5 x i8] c"name\00", align 1
@.str.88 = private unnamed_addr constant [4 x i8] c"Bob\00", align 1
@.str.89 = private unnamed_addr constant [5 x i8] c"role\00", align 1
@.str.90 = private unnamed_addr constant [6 x i8] c"Admin\00", align 1
@.str.91 = private unnamed_addr constant [3 x i8] c" (\00", align 1
@.str.92 = private unnamed_addr constant [2 x i8] c")\00", align 1
@.str.93 = private unnamed_addr constant [17 x i8] c"record_pattern: \00", align 1
@.str.94 = private unnamed_addr constant [9 x i8] c"finished\00", align 1
@.str.95 = private unnamed_addr constant [6 x i8] c"other\00", align 1
@.str.96 = private unnamed_addr constant [19 x i8] c"fallback_pattern: \00", align 1
@.str.97 = private unnamed_addr constant [32 x i8] c"[TEST 11: MODULES & NAMESPACES]\00", align 1
@.str.98 = private unnamed_addr constant [14 x i8] c"module_call: \00", align 1
@.str.99 = private unnamed_addr constant [16 x i8] c"nested_module: \00", align 1
@.str.100 = private unnamed_addr constant [10 x i8] c"Commander\00", align 1
@.str.101 = private unnamed_addr constant [33 x i8] c"[TEST 12: MONADIC WHERE CLAUSES]\00", align 1
@.str.102 = private unnamed_addr constant [20 x i8] c"where_computation: \00", align 1
@.str.103 = private unnamed_addr constant [33 x i8] c"[TEST 13: MATH STANDARD LIBRARY]\00", align 1
@.str.104 = private unnamed_addr constant [7 x i8] c"sqrt: \00", align 1
@.str.105 = private unnamed_addr constant [8 x i8] c"floor: \00", align 1
@.str.106 = private unnamed_addr constant [6 x i8] c"abs: \00", align 1
@.str.107 = private unnamed_addr constant [38 x i8] c"=== ALL TESTS PASSED SUCCESSFULLY ===\00", align 1

; --- Global and Module Variables ---
@i = global i8* null, align 8
@f = global i8* null, align 8
@neg = global i8* null, align 8
@arith = global i8* null, align 8
@modVal = global i8* null, align 8
@precedence = global i8* null, align 8
@greeting = global i8* null, align 8
@mutVal = global i8* null, align 8
@outerX = global i8* null, align 8
@innerShadow = global i8* null, align 8
@blockVal = global i8* null, align 8
@squareFn = global i8* null, align 8
@applied = global i8* null, align 8
@timesThree = global i8* null, align 8
@condVal = global i8* null, align 8
@ifResult = global i8* null, align 8
@ternResult = global i8* null, align 8
@whileIdx = global i8* null, align 8
@whileSum = global i8* null, align 8
@loopCtr = global i8* null, align 8
@loopAcc = global i8* null, align 8
@forSum = global i8* null, align 8
@gridCount = global i8* null, align 8
@dayCode = global i8* null, align 8
@dayName = global i8* null, align 8
@pt = global i8* null, align 8
@cfg = global i8* null, align 8
@origPt = global i8* null, align 8
@modPt = global i8* null, align 8
@pairTup = global i8* null, align 8
@dr = global i8* null, align 8
@sampleArr = global i8* null, align 8
@col = global i8* null, align 8
@colStr = global i8* null, align 8
@mb = global i8* null, align 8
@mbVal = global i8* null, align 8
@intList = global i8* null, align 8
@astTree = global i8* null, align 8
@matchNum = global i8* null, align 8
@numWord = global i8* null, align 8
@unwrapped = global i8* null, align 8
@pp = global i8* null, align 8
@ppSum = global i8* null, align 8
@coords = global i8* null, align 8
@pythagoras = global i8* null, align 8
@userRec = global i8* null, align 8
@userGreeting = global i8* null, align 8
@taskSt = global i8* null, align 8
@taskDone = global i8* null, align 8

; --- External POSIX C Library Declarations ---
declare i32 @printf(i8*, ...)
declare i32 @sprintf(i8*, i8*, ...)
declare i32 @puts(i8*)
declare i8* @malloc(i64)
declare void @free(i8*)
declare void @exit(i32)
declare i64 @strlen(i8*)
declare i8* @strcpy(i8*, i8*)
declare i8* @strcat(i8*, i8*)
declare i32 @strcmp(i8*, i8*)
declare double @atof(i8*)
declare i64 @atoll(i8*)
declare double @llvm.sqrt.f64(double)
declare double @llvm.pow.f64(double, double)
declare double @llvm.fabs.f64(double)
declare double @llvm.floor.f64(double)
declare double @llvm.ceil.f64(double)
declare double @llvm.sin.f64(double)
declare double @llvm.cos.f64(double)


; --- Runtime Helper: Dynamic Record Field Lookup ---
define i8* @_tl_record_get(i8* %rec, i8* %field) {
entry:
  %cmp_null = icmp eq i8* %rec, null
  br i1 %cmp_null, label %ret_null, label %check_rec
check_rec:
  %count_ptr = bitcast i8* %rec to i64*
  %count = load i64, i64* %count_ptr, align 8
  br label %loop.cond
loop.cond:
  %i = phi i64 [ 0, %check_rec ], [ %next_i, %loop.step ]
  %done = icmp sge i64 %i, %count
  br i1 %done, label %ret_null, label %loop.body
loop.body:
  %slot_offset = mul i64 %i, 16
  %key_offset = add i64 %slot_offset, 8
  %key_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %key_offset
  %key_ptr_cast = bitcast i8* %key_ptr_loc to i8**
  %key = load i8*, i8** %key_ptr_cast, align 8
  %cmp = call i32 @strcmp(i8* %key, i8* %field)
  %match = icmp eq i32 %cmp, 0
  br i1 %match, label %found, label %loop.step
found:
  %val_offset = add i64 %slot_offset, 16
  %val_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %val_offset
  %val_ptr_cast = bitcast i8* %val_ptr_loc to i8**
  %val = load i8*, i8** %val_ptr_cast, align 8
  ret i8* %val
loop.step:
  %next_i = add i64 %i, 1
  br label %loop.cond
ret_null:
  ret i8* null
}


; --- Runtime Helper: Array Join ---
define i8* @_tl_array_join(%struct.Array* %arr, i8* %sep) {
entry:
  %cmp_null = icmp eq %struct.Array* %arr, null
  br i1 %cmp_null, label %ret_empty, label %check_len
check_len:
  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0
  %len = load i64, i64* %len_ptr, align 8
  %cmp_zero = icmp sle i64 %len, 0
  br i1 %cmp_zero, label %ret_empty, label %alloc_buf
alloc_buf:
  %buf = call i8* @malloc(i64 65536)
  store i8 0, i8* %buf, align 1
  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1
  %elems = load i8**, i8*** %data_ptr, align 8
  br label %join.loop.cond
join.loop.cond:
  %i = phi i64 [ 0, %alloc_buf ], [ %next_i, %join.loop.step ]
  %done = icmp sge i64 %i, %len
  br i1 %done, label %join.done, label %join.loop.body
join.loop.body:
  %is_first = icmp eq i64 %i, 0
  br i1 %is_first, label %append_elem, label %check_sep
check_sep:
  %sep_null = icmp eq i8* %sep, null
  br i1 %sep_null, label %append_elem, label %append_sep
append_sep:
  %tmp_cat1 = call i8* @strcat(i8* %buf, i8* %sep)
  br label %append_elem
append_elem:
  %elem_slot = getelementptr inbounds i8*, i8** %elems, i64 %i
  %elem_str = load i8*, i8** %elem_slot, align 8
  %elem_null = icmp eq i8* %elem_str, null
  br i1 %elem_null, label %join.loop.step, label %do_elem_cat
do_elem_cat:
  %tmp_cat2 = call i8* @strcat(i8* %buf, i8* %elem_str)
  br label %join.loop.step
join.loop.step:
  %next_i = add i64 %i, 1
  br label %join.loop.cond
join.done:
  ret i8* %buf
ret_empty:
  %empty = call i8* @malloc(i64 1)
  store i8 0, i8* %empty, align 1
  ret i8* %empty
}


; --- Runtime Helper: Array Push ---
define %struct.Array* @_tl_array_push(%struct.Array* %arr, i8* %elem) {
entry:
  %cmp_null = icmp eq %struct.Array* %arr, null
  br i1 %cmp_null, label %ret_null, label %do_push
do_push:
  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0
  %len = load i64, i64* %len_ptr, align 8
  %new_len = add i64 %len, 1
  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1
  %old_data = load i8**, i8*** %data_ptr, align 8
  %new_bytes = mul i64 %new_len, 8
  %new_data_raw = call i8* @malloc(i64 %new_bytes)
  %new_data = bitcast i8* %new_data_raw to i8**
  br label %push.loop.cond
push.loop.cond:
  %idx = phi i64 [ 0, %do_push ], [ %next_idx, %push.loop.body ]
  %cmp_done = icmp sge i64 %idx, %len
  br i1 %cmp_done, label %push.loop.end, label %push.loop.body
push.loop.body:
  %old_slot = getelementptr inbounds i8*, i8** %old_data, i64 %idx
  %old_val = load i8*, i8** %old_slot, align 8
  %new_slot = getelementptr inbounds i8*, i8** %new_data, i64 %idx
  store i8* %old_val, i8** %new_slot, align 8
  %next_idx = add i64 %idx, 1
  br label %push.loop.cond
push.loop.end:
  %push_slot = getelementptr inbounds i8*, i8** %new_data, i64 %len
  store i8* %elem, i8** %push_slot, align 8
  store i64 %new_len, i64* %len_ptr, align 8
  store i8** %new_data, i8*** %data_ptr, align 8
  ret %struct.Array* %arr
ret_null:
  ret %struct.Array* null
}

define internal i8* @.lambda_1(i8* %arg.x) {
entry:
  %t136 = alloca double, align 8
  %t137 = ptrtoint i8* %arg.x to i64
  %t138 = bitcast i64 %t137 to double
  store double %t138, double* %t136, align 8
  %t139 = load double, double* %t136, align 8
  %t140 = fmul double %t139, 0.0
  %t141 = bitcast double %t140 to i64
  %t142 = inttoptr i64 %t141 to i8*
  ret i8* %t142
}

define internal i8* @.lambda_2(i8* %arg.x) {
entry:
  %t475 = alloca double, align 8
  %t476 = ptrtoint i8* %arg.x to i64
  %t477 = bitcast i64 %t476 to double
  store double %t477, double* %t475, align 8
  %t478 = load double, double* %t475, align 8
  %t479 = load double, double* %t475, align 8
  %t480 = fmul double %t478, %t479
  %t481 = bitcast double %t480 to i64
  %t482 = inttoptr i64 %t481 to i8*
  ret i8* %t482
}

define internal i8* @.lambda_3(i8* %arg.x) {
entry:
  %t498 = alloca double, align 8
  %t499 = ptrtoint i8* %arg.x to i64
  %t500 = bitcast i64 %t499 to double
  store double %t500, double* %t498, align 8
  %t501 = load double, double* %t498, align 8
  %t502 = fadd double %t501, 1.0
  %t503 = bitcast double %t502 to i64
  %t504 = inttoptr i64 %t503 to i8*
  ret i8* %t504
}

define double @MathCore_square(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t1 = load double, double* %n.addr, align 8
  %t2 = load double, double* %n.addr, align 8
  %t3 = fmul double %t1, %t2
  ret double %t3
}

define i8* @MathCore_Nested_greet(i8* %arg.name) {
entry:
  %name.addr = alloca i8*, align 8
  store i8* %arg.name, i8** %name.addr, align 8
  %t4 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.0, i64 0, i64 0
  %t5 = load i8*, i8** %name.addr, align 8
  %t6 = call i64 @strlen(i8* %t4)
  %t7 = call i64 @strlen(i8* %t5)
  %t8 = add i64 %t6, %t7
  %t9 = add i64 %t8, 1
  %t10 = call i8* @malloc(i64 %t9)
  %t11 = call i8* @strcpy(i8* %t10, i8* %t4)
  %t12 = call i8* @strcat(i8* %t10, i8* %t5)
  ret i8* %t10
}

define double @evaluateAST(%struct.GADTValue* %arg.e) {
entry:
  %e.addr = alloca %struct.GADTValue*, align 8
  %t21 = alloca i8*, align 8
  %t28 = alloca i8*, align 8
  %t32 = alloca i8*, align 8
  store %struct.GADTValue* %arg.e, %struct.GADTValue** %e.addr, align 8
  %t13 = load %struct.GADTValue*, %struct.GADTValue** %e.addr, align 8
  %t15 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t13, i32 0, i32 0
  %t14 = load i32, i32* %t15, align 4
  switch i32 %t14, label %match.default.1 [ i32 0, label %match.arm0.3 i32 1, label %match.arm1.4 ]
match.arm0.3:
  %t16 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t13, i32 0, i32 1
  %t17 = load i8*, i8** %t16, align 8
  %t18 = getelementptr inbounds i8, i8* %t17, i64 0
  %t19 = bitcast i8* %t18 to i8**
  %t20 = load i8*, i8** %t19, align 8
  store i8* %t20, i8** %t21, align 8
  %t22 = load i8*, i8** %t21, align 8
  %t41 = ptrtoint i8* %t22 to i64
  %t40 = bitcast i64 %t41 to double
  br label %match.merge.2
match.arm1.4:
  %t23 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t13, i32 0, i32 1
  %t24 = load i8*, i8** %t23, align 8
  %t25 = getelementptr inbounds i8, i8* %t24, i64 0
  %t26 = bitcast i8* %t25 to i8**
  %t27 = load i8*, i8** %t26, align 8
  store i8* %t27, i8** %t28, align 8
  %t29 = getelementptr inbounds i8, i8* %t24, i64 8
  %t30 = bitcast i8* %t29 to i8**
  %t31 = load i8*, i8** %t30, align 8
  store i8* %t31, i8** %t32, align 8
  %t33 = load i8*, i8** %t28, align 8
  %t34 = bitcast i8* %t33 to %struct.GADTValue*
  %t35 = call double @evaluateAST(%struct.GADTValue* %t34)
  %t36 = load i8*, i8** %t32, align 8
  %t37 = bitcast i8* %t36 to %struct.GADTValue*
  %t38 = call double @evaluateAST(%struct.GADTValue* %t37)
  %t39 = fadd double %t35, %t38
  br label %match.merge.2
match.default.1:
  br label %match.merge.2
match.merge.2:
  %t43 = phi double [ %t40, %match.arm0.3 ], [ %t39, %match.arm1.4 ], [ 0.0, %match.default.1 ]
  ret double %t43
}

define double @sumList(%struct.GADTValue* %arg.list) {
entry:
  %list.addr = alloca %struct.GADTValue*, align 8
  %t52 = alloca i8*, align 8
  %t56 = alloca i8*, align 8
  store %struct.GADTValue* %arg.list, %struct.GADTValue** %list.addr, align 8
  %t44 = load %struct.GADTValue*, %struct.GADTValue** %list.addr, align 8
  %t46 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t44, i32 0, i32 0
  %t45 = load i32, i32* %t46, align 4
  switch i32 %t45, label %match.default.5 [ i32 0, label %match.arm0.7 i32 1, label %match.arm1.8 ]
match.arm0.7:
  %t47 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t44, i32 0, i32 1
  %t48 = load i8*, i8** %t47, align 8
  %t49 = getelementptr inbounds i8, i8* %t48, i64 0
  %t50 = bitcast i8* %t49 to i8**
  %t51 = load i8*, i8** %t50, align 8
  store i8* %t51, i8** %t52, align 8
  %t53 = getelementptr inbounds i8, i8* %t48, i64 8
  %t54 = bitcast i8* %t53 to i8**
  %t55 = load i8*, i8** %t54, align 8
  store i8* %t55, i8** %t56, align 8
  %t57 = load i8*, i8** %t52, align 8
  %t58 = load i8*, i8** %t56, align 8
  %t59 = bitcast i8* %t58 to %struct.GADTValue*
  %t60 = call double @sumList(%struct.GADTValue* %t59)
  %t63 = ptrtoint i8* %t57 to i64
  %t62 = bitcast i64 %t63 to double
  %t61 = fadd double %t62, %t60
  br label %match.merge.6
match.arm1.8:
  br label %match.merge.6
match.default.5:
  br label %match.merge.6
match.merge.6:
  %t65 = phi double [ %t61, %match.arm0.7 ], [ 0.0, %match.arm1.8 ], [ 0.0, %match.default.5 ]
  ret double %t65
}

define double @addNumbers(double %arg.a, double %arg.b) {
entry:
  %a.addr = alloca double, align 8
  %b.addr = alloca double, align 8
  store double %arg.a, double* %a.addr, align 8
  store double %arg.b, double* %b.addr, align 8
  %t66 = load double, double* %a.addr, align 8
  %t67 = load double, double* %b.addr, align 8
  %t68 = fadd double %t66, %t67
  ret double %t68
}

define double @factorial(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t69 = load double, double* %n.addr, align 8
  %t70 = fcmp ole double %t69, 1.0
  br i1 %t70, label %then.9, label %else.10
then.9:
  br label %if.merge.11
else.10:
  %t71 = load double, double* %n.addr, align 8
  %t72 = load double, double* %n.addr, align 8
  %t73 = fsub double %t72, 1.0
  %t74 = call double @factorial(double %t73)
  %t75 = fmul double %t71, %t74
  br label %if.merge.11
if.merge.11:
  %t76 = phi double [ 1.0, %then.9 ], [ %t75, %else.10 ]
  ret double %t76
}

define double @fibonacci(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t77 = load double, double* %n.addr, align 8
  %t78 = fcmp ole double %t77, 0.0
  br i1 %t78, label %then.12, label %else.13
then.12:
  br label %if.merge.14
else.13:
  %t79 = load double, double* %n.addr, align 8
  %t80 = fcmp oeq double %t79, 1.0
  br i1 %t80, label %then.15, label %else.16
then.15:
  br label %if.merge.17
else.16:
  %t81 = load double, double* %n.addr, align 8
  %t82 = fsub double %t81, 1.0
  %t83 = call double @fibonacci(double %t82)
  %t84 = load double, double* %n.addr, align 8
  %t85 = fsub double %t84, 2.0
  %t86 = call double @fibonacci(double %t85)
  %t87 = fadd double %t83, %t86
  br label %if.merge.17
if.merge.17:
  %t88 = phi double [ 1.0, %then.15 ], [ %t87, %else.16 ]
  br label %if.merge.14
if.merge.14:
  %t89 = phi double [ 0.0, %then.12 ], [ %t88, %if.merge.17 ]
  ret double %t89
}

define i1 @isEven(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t90 = load double, double* %n.addr, align 8
  %t91 = fcmp oeq double %t90, 0.0
  br i1 %t91, label %then.18, label %else.19
then.18:
  br label %if.merge.20
else.19:
  %t92 = load double, double* %n.addr, align 8
  %t93 = fsub double %t92, 1.0
  %t94 = call i1 @isOdd(double %t93)
  br label %if.merge.20
if.merge.20:
  %t95 = phi i1 [ 1, %then.18 ], [ %t94, %else.19 ]
  ret i1 %t95
}

define i1 @isOdd(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t96 = load double, double* %n.addr, align 8
  %t97 = fcmp oeq double %t96, 0.0
  br i1 %t97, label %then.21, label %else.22
then.21:
  br label %if.merge.23
else.22:
  %t98 = load double, double* %n.addr, align 8
  %t99 = fsub double %t98, 1.0
  %t100 = call i1 @isEven(double %t99)
  br label %if.merge.23
if.merge.23:
  %t101 = phi i1 [ 0, %then.21 ], [ %t100, %else.22 ]
  ret i1 %t101
}

define double @earlyReturnTest(double %arg.v) {
entry:
  %v.addr = alloca double, align 8
  store double %arg.v, double* %v.addr, align 8
  %t102 = load double, double* %v.addr, align 8
  %t103 = fcmp ogt double %t102, 10.0
  br i1 %t103, label %then.24, label %else.25
then.24:
  br label %if.merge.26
else.25:
  br label %if.merge.26
if.merge.26:
  ret double 0.0
}

define i8* @divRem(double %arg.a, double %arg.b) {
entry:
  %a.addr = alloca double, align 8
  %b.addr = alloca double, align 8
  %q.var = alloca double, align 8
  %r.var = alloca double, align 8
  store double %arg.a, double* %a.addr, align 8
  store double %arg.b, double* %b.addr, align 8
  %t104 = load double, double* %a.addr, align 8
  %t105 = load double, double* %b.addr, align 8
  %t106 = fdiv double %t104, %t105
  %t107 = call double @llvm.floor.f64(double %t106)
  store double %t107, double* %q.var, align 8
  %t108 = load double, double* %a.addr, align 8
  %t109 = load double, double* %b.addr, align 8
  %t110 = frem double %t108, %t109
  store double %t110, double* %r.var, align 8
  %t111 = call i8* @malloc(i64 16)
  %t112 = bitcast i8* %t111 to %struct.Array*
  %t113 = getelementptr inbounds %struct.Array, %struct.Array* %t112, i32 0, i32 0
  store i64 2, i64* %t113, align 8
  %t114 = call i8* @malloc(i64 16)
  %t115 = load double, double* %q.var, align 8
  %t116 = bitcast double %t115 to i64
  %t117 = inttoptr i64 %t116 to i8*
  %t118 = getelementptr inbounds i8, i8* %t114, i64 0
  %t119 = bitcast i8* %t118 to i8**
  store i8* %t117, i8** %t119, align 8
  %t120 = load double, double* %r.var, align 8
  %t121 = bitcast double %t120 to i64
  %t122 = inttoptr i64 %t121 to i8*
  %t123 = getelementptr inbounds i8, i8* %t114, i64 8
  %t124 = bitcast i8* %t123 to i8**
  store i8* %t122, i8** %t124, align 8
  %t125 = getelementptr inbounds %struct.Array, %struct.Array* %t112, i32 0, i32 1
  %t126 = bitcast i8* %t114 to i8**
  store i8** %t126, i8*** %t125, align 8
  %t127 = bitcast %struct.Array* %t112 to i8*
  ret i8* %t127
}

define double @applyCallback(i8* %arg.f, double %arg.val) {
entry:
  %f.addr = alloca i8*, align 8
  %val.addr = alloca double, align 8
  store i8* %arg.f, i8** %f.addr, align 8
  store double %arg.val, double* %val.addr, align 8
  %t128 = load i8*, i8** %f.addr, align 8
  %t129 = load double, double* %val.addr, align 8
  %t130 = bitcast i8* %t128 to i8* (i8*)*
  %t131 = bitcast double %t129 to i64
  %t132 = inttoptr i64 %t131 to i8*
  %t133 = call i8* %t130(i8* %t132)
  %t134 = ptrtoint i8* %t133 to i64
  %t135 = bitcast i64 %t134 to double
  ret double %t135
}

define i8* @makeMultiplier(double %arg.factor) {
entry:
  %factor.addr = alloca double, align 8
  store double %arg.factor, double* %factor.addr, align 8
  %t143 = bitcast i8* (i8*)* @.lambda_1 to i8*
  ret i8* %t143
}

define double @computeWithWhere(double %arg.x) {
entry:
  %x.addr = alloca double, align 8
  %baseOffset.var = alloca double, align 8
  store double %arg.x, double* %x.addr, align 8
  store double 10.0, double* %baseOffset.var, align 8
  %t144 = load double, double* %x.addr, align 8
  %t145 = call double @helper(double %t144)
  %t146 = load double, double* %baseOffset.var, align 8
  %t147 = fadd double %t145, %t146
  ret double %t147
}

define double @helper(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t148 = load double, double* %n.addr, align 8
  %t149 = fmul double %t148, 2.0
  ret double %t149
}

define i8* @classifyShape(%struct.GADTValue* %arg.s) {
entry:
  %s.addr = alloca %struct.GADTValue*, align 8
  %t158 = alloca i8*, align 8
  %t169 = alloca i8*, align 8
  %t176 = alloca i8*, align 8
  %t180 = alloca i8*, align 8
  store %struct.GADTValue* %arg.s, %struct.GADTValue** %s.addr, align 8
  %t150 = load %struct.GADTValue*, %struct.GADTValue** %s.addr, align 8
  %t152 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t150, i32 0, i32 0
  %t151 = load i32, i32* %t152, align 4
  switch i32 %t151, label %match.default.27 [ i32 0, label %match.arm0.29 i32 1, label %match.arm2.31 ]
match.arm0.29:
  %t153 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t150, i32 0, i32 1
  %t154 = load i8*, i8** %t153, align 8
  %t155 = getelementptr inbounds i8, i8* %t154, i64 0
  %t156 = bitcast i8* %t155 to i8**
  %t157 = load i8*, i8** %t156, align 8
  store i8* %t157, i8** %t158, align 8
  %t159 = load i8*, i8** %t158, align 8
  %t162 = ptrtoint i8* %t159 to i64
  %t161 = bitcast i64 %t162 to double
  %t160 = fcmp ogt double %t161, 10.0
  br i1 %t160, label %match.guard_pass0.32, label %match.arm1.30
match.guard_pass0.32:
  %t163 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.1, i64 0, i64 0
  br label %match.merge.28
match.arm1.30:
  %t164 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t150, i32 0, i32 1
  %t165 = load i8*, i8** %t164, align 8
  %t166 = getelementptr inbounds i8, i8* %t165, i64 0
  %t167 = bitcast i8* %t166 to i8**
  %t168 = load i8*, i8** %t167, align 8
  store i8* %t168, i8** %t169, align 8
  %t170 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.2, i64 0, i64 0
  br label %match.merge.28
match.arm2.31:
  %t171 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t150, i32 0, i32 1
  %t172 = load i8*, i8** %t171, align 8
  %t173 = getelementptr inbounds i8, i8* %t172, i64 0
  %t174 = bitcast i8* %t173 to i8**
  %t175 = load i8*, i8** %t174, align 8
  store i8* %t175, i8** %t176, align 8
  %t177 = getelementptr inbounds i8, i8* %t172, i64 8
  %t178 = bitcast i8* %t177 to i8**
  %t179 = load i8*, i8** %t178, align 8
  store i8* %t179, i8** %t180, align 8
  %t181 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.3, i64 0, i64 0
  br label %match.merge.28
match.default.27:
  br label %match.merge.28
match.merge.28:
  %t182 = phi i8* [ %t163, %match.guard_pass0.32 ], [ %t170, %match.arm1.30 ], [ %t181, %match.arm2.31 ], [ null, %match.default.27 ]
  ret i8* %t182
}

define i32 @main() {
entry:
  %i.var = alloca double, align 8
  %f.var = alloca double, align 8
  %neg.var = alloca double, align 8
  %arith.var = alloca double, align 8
  %modVal.var = alloca double, align 8
  %precedence.var = alloca double, align 8
  %greeting.var = alloca i8*, align 8
  %mutVal.var = alloca double, align 8
  %outerX.var = alloca double, align 8
  %outerX.1.var = alloca double, align 8
  %innerShadow.var = alloca double, align 8
  %b1.var = alloca double, align 8
  %b2.var = alloca double, align 8
  %blockVal.var = alloca double, align 8
  %squareFn.var = alloca i8*, align 8
  %applied.var = alloca double, align 8
  %timesThree.var = alloca i8*, align 8
  %condVal.var = alloca double, align 8
  %ifResult.var = alloca i8*, align 8
  %ternResult.var = alloca i8*, align 8
  %whileIdx.var = alloca double, align 8
  %whileSum.var = alloca double, align 8
  %loopCtr.var = alloca double, align 8
  %loopAcc.var = alloca double, align 8
  %forSum.var = alloca double, align 8
  %fi.var = alloca double, align 8
  %gridCount.var = alloca double, align 8
  %r.var = alloca double, align 8
  %c.var = alloca double, align 8
  %dayCode.var = alloca double, align 8
  %dayName.var = alloca i8*, align 8
  %pt.var = alloca i8*, align 8
  %cfg.var = alloca i8*, align 8
  %origPt.var = alloca i8*, align 8
  %modPt.var = alloca i8*, align 8
  %pairTup.var = alloca %struct.Array*, align 8
  %dr.var = alloca i8*, align 8
  %sampleArr.var = alloca %struct.Array*, align 8
  %col.var = alloca %struct.GADTValue*, align 8
  %colStr.var = alloca i8*, align 8
  %mb.var = alloca %struct.GADTValue*, align 8
  %t1017 = alloca i8*, align 8
  %mbVal.var = alloca double, align 8
  %intList.var = alloca %struct.GADTValue*, align 8
  %astTree.var = alloca %struct.GADTValue*, align 8
  %matchNum.var = alloca double, align 8
  %numWord.var = alloca i8*, align 8
  %t1193 = alloca i8*, align 8
  %unwrapped.var = alloca double, align 8
  %pp.var = alloca %struct.GADTValue*, align 8
  %t1237 = alloca i8*, align 8
  %t1241 = alloca i8*, align 8
  %ppSum.var = alloca double, align 8
  %coords.var = alloca %struct.Array*, align 8
  %pythagoras.var = alloca double, align 8
  %userRec.var = alloca i8*, align 8
  %t1343 = alloca i8*, align 8
  %t1346 = alloca i8*, align 8
  %userGreeting.var = alloca i8*, align 8
  %taskSt.var = alloca %struct.GADTValue*, align 8
  %taskDone.var = alloca i8*, align 8
  ; GADT Sum Type Definition: Color
  ;   Constructor [0]: Red()
  ;   Constructor [1]: Green()
  ;   Constructor [2]: Blue()
  ; GADT Sum Type Definition: MaybeNumber
  ;   Constructor [0]: Just(val)
  ;   Constructor [1]: Nothing()
  ; GADT Sum Type Definition: IntList
  ;   Constructor [0]: Cons(head, tail)
  ;   Constructor [1]: Nil()
  ; GADT Sum Type Definition: ExprAST
  ;   Constructor [0]: NumLit(val)
  ;   Constructor [1]: AddExpr(left, right)
  %t183 = getelementptr inbounds [40 x i8], [40 x i8]* @.str.4, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t183)
  %t184 = getelementptr inbounds [34 x i8], [34 x i8]* @.str.5, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t184)
  store double 42.0, double* %i.var, align 8
  %t185 = fadd double 42.0, 0.0
  %t186 = bitcast double %t185 to i64
  %t187 = inttoptr i64 %t186 to i8*
  store i8* %t187, i8** @i, align 8
  store double 3.14159, double* %f.var, align 8
  %t188 = fadd double 3.14159, 0.0
  %t189 = bitcast double %t188 to i64
  %t190 = inttoptr i64 %t189 to i8*
  store i8* %t190, i8** @f, align 8
  %t191 = fneg double 15.0
  store double %t191, double* %neg.var, align 8
  %t192 = bitcast double %t191 to i64
  %t193 = inttoptr i64 %t192 to i8*
  store i8* %t193, i8** @neg, align 8
  %t194 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.6, i64 0, i64 0
  %t195 = load double, double* %i.var, align 8
  %t196 = call i8* @malloc(i64 64)
  %t197 = call i32 (i8*, i8*, ...) @sprintf(i8* %t196, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t195)
  %t198 = call i64 @strlen(i8* %t194)
  %t199 = call i64 @strlen(i8* %t196)
  %t200 = add i64 %t198, %t199
  %t201 = add i64 %t200, 1
  %t202 = call i8* @malloc(i64 %t201)
  %t203 = call i8* @strcpy(i8* %t202, i8* %t194)
  %t204 = call i8* @strcat(i8* %t202, i8* %t196)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t202)
  %t205 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.7, i64 0, i64 0
  %t206 = load double, double* %f.var, align 8
  %t207 = call i8* @malloc(i64 64)
  %t208 = call i32 (i8*, i8*, ...) @sprintf(i8* %t207, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t206)
  %t209 = call i64 @strlen(i8* %t205)
  %t210 = call i64 @strlen(i8* %t207)
  %t211 = add i64 %t209, %t210
  %t212 = add i64 %t211, 1
  %t213 = call i8* @malloc(i64 %t212)
  %t214 = call i8* @strcpy(i8* %t213, i8* %t205)
  %t215 = call i8* @strcat(i8* %t213, i8* %t207)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t213)
  %t216 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.8, i64 0, i64 0
  %t217 = load double, double* %neg.var, align 8
  %t218 = call i8* @malloc(i64 64)
  %t219 = call i32 (i8*, i8*, ...) @sprintf(i8* %t218, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t217)
  %t220 = call i64 @strlen(i8* %t216)
  %t221 = call i64 @strlen(i8* %t218)
  %t222 = add i64 %t220, %t221
  %t223 = add i64 %t222, 1
  %t224 = call i8* @malloc(i64 %t223)
  %t225 = call i8* @strcpy(i8* %t224, i8* %t216)
  %t226 = call i8* @strcat(i8* %t224, i8* %t218)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t224)
  %t227 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.9, i64 0, i64 0
  %t228 = call i8* @malloc(i64 64)
  %t229 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t230 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t231 = select i1 1, i8* %t229, i8* %t230
  %t232 = call i8* @strcpy(i8* %t228, i8* %t231)
  %t233 = getelementptr inbounds [3 x i8], [3 x i8]* @.str.10, i64 0, i64 0
  %t234 = call i8* @malloc(i64 64)
  %t235 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t236 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t237 = select i1 0, i8* %t235, i8* %t236
  %t238 = call i8* @strcpy(i8* %t234, i8* %t237)
  %t239 = call i64 @strlen(i8* %t233)
  %t240 = call i64 @strlen(i8* %t234)
  %t241 = add i64 %t239, %t240
  %t242 = add i64 %t241, 1
  %t243 = call i8* @malloc(i64 %t242)
  %t244 = call i8* @strcpy(i8* %t243, i8* %t233)
  %t245 = call i8* @strcat(i8* %t243, i8* %t234)
  %t246 = call i64 @strlen(i8* %t228)
  %t247 = call i64 @strlen(i8* %t243)
  %t248 = add i64 %t246, %t247
  %t249 = add i64 %t248, 1
  %t250 = call i8* @malloc(i64 %t249)
  %t251 = call i8* @strcpy(i8* %t250, i8* %t228)
  %t252 = call i8* @strcat(i8* %t250, i8* %t243)
  %t253 = call i64 @strlen(i8* %t227)
  %t254 = call i64 @strlen(i8* %t250)
  %t255 = add i64 %t253, %t254
  %t256 = add i64 %t255, 1
  %t257 = call i8* @malloc(i64 %t256)
  %t258 = call i8* @strcpy(i8* %t257, i8* %t227)
  %t259 = call i8* @strcat(i8* %t257, i8* %t250)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t257)
  %t260 = fadd double 10.0, 5.0
  %t261 = fmul double %t260, 2.0
  %t262 = fdiv double 9.0, 2.0
  %t263 = fsub double %t261, %t262
  store double %t263, double* %arith.var, align 8
  %t264 = bitcast double %t263 to i64
  %t265 = inttoptr i64 %t264 to i8*
  store i8* %t265, i8** @arith, align 8
  %t266 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.11, i64 0, i64 0
  %t267 = load double, double* %arith.var, align 8
  %t268 = call i8* @malloc(i64 64)
  %t269 = call i32 (i8*, i8*, ...) @sprintf(i8* %t268, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t267)
  %t270 = call i64 @strlen(i8* %t266)
  %t271 = call i64 @strlen(i8* %t268)
  %t272 = add i64 %t270, %t271
  %t273 = add i64 %t272, 1
  %t274 = call i8* @malloc(i64 %t273)
  %t275 = call i8* @strcpy(i8* %t274, i8* %t266)
  %t276 = call i8* @strcat(i8* %t274, i8* %t268)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t274)
  %t277 = frem double 17.0, 5.0
  store double %t277, double* %modVal.var, align 8
  %t278 = bitcast double %t277 to i64
  %t279 = inttoptr i64 %t278 to i8*
  store i8* %t279, i8** @modVal, align 8
  %t280 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.12, i64 0, i64 0
  %t281 = load double, double* %modVal.var, align 8
  %t282 = call i8* @malloc(i64 64)
  %t283 = call i32 (i8*, i8*, ...) @sprintf(i8* %t282, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t281)
  %t284 = call i64 @strlen(i8* %t280)
  %t285 = call i64 @strlen(i8* %t282)
  %t286 = add i64 %t284, %t285
  %t287 = add i64 %t286, 1
  %t288 = call i8* @malloc(i64 %t287)
  %t289 = call i8* @strcpy(i8* %t288, i8* %t280)
  %t290 = call i8* @strcat(i8* %t288, i8* %t282)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t288)
  %t291 = fmul double 3.0, 4.0
  %t292 = fadd double 2.0, %t291
  store double %t292, double* %precedence.var, align 8
  %t293 = bitcast double %t292 to i64
  %t294 = inttoptr i64 %t293 to i8*
  store i8* %t294, i8** @precedence, align 8
  %t295 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.13, i64 0, i64 0
  %t296 = load double, double* %precedence.var, align 8
  %t297 = call i8* @malloc(i64 64)
  %t298 = call i32 (i8*, i8*, ...) @sprintf(i8* %t297, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t296)
  %t299 = call i64 @strlen(i8* %t295)
  %t300 = call i64 @strlen(i8* %t297)
  %t301 = add i64 %t299, %t300
  %t302 = add i64 %t301, 1
  %t303 = call i8* @malloc(i64 %t302)
  %t304 = call i8* @strcpy(i8* %t303, i8* %t295)
  %t305 = call i8* @strcat(i8* %t303, i8* %t297)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t303)
  %t306 = getelementptr inbounds [34 x i8], [34 x i8]* @.str.14, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t306)
  %t307 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.15, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t307)
  %t308 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.16, i64 0, i64 0
  %t309 = getelementptr inbounds [23 x i8], [23 x i8]* @.str.17, i64 0, i64 0
  %t310 = call i64 @strlen(i8* %t308)
  %t311 = call i64 @strlen(i8* %t309)
  %t312 = add i64 %t310, %t311
  %t313 = add i64 %t312, 1
  %t314 = call i8* @malloc(i64 %t313)
  %t315 = call i8* @strcpy(i8* %t314, i8* %t308)
  %t316 = call i8* @strcat(i8* %t314, i8* %t309)
  store i8* %t314, i8** %greeting.var, align 8
  store i8* %t314, i8** @greeting, align 8
  %t317 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.18, i64 0, i64 0
  %t318 = load i8*, i8** %greeting.var, align 8
  %t319 = call i64 @strlen(i8* %t317)
  %t320 = call i64 @strlen(i8* %t318)
  %t321 = add i64 %t319, %t320
  %t322 = add i64 %t321, 1
  %t323 = call i8* @malloc(i64 %t322)
  %t324 = call i8* @strcpy(i8* %t323, i8* %t317)
  %t325 = call i8* @strcat(i8* %t323, i8* %t318)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t323)
  %t326 = getelementptr inbounds [33 x i8], [33 x i8]* @.str.19, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t326)
  store double 50.0, double* %mutVal.var, align 8
  %t327 = fadd double 50.0, 0.0
  %t328 = bitcast double %t327 to i64
  %t329 = inttoptr i64 %t328 to i8*
  store i8* %t329, i8** @mutVal, align 8
  store double 100.0, double* %mutVal.var, align 8
  %t330 = load double, double* %mutVal.var, align 8
  %t331 = fadd double %t330, 50.0
  store double %t331, double* %mutVal.var, align 8
  %t332 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.20, i64 0, i64 0
  %t333 = load double, double* %mutVal.var, align 8
  %t334 = call i8* @malloc(i64 64)
  %t335 = call i32 (i8*, i8*, ...) @sprintf(i8* %t334, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t333)
  %t336 = call i64 @strlen(i8* %t332)
  %t337 = call i64 @strlen(i8* %t334)
  %t338 = add i64 %t336, %t337
  %t339 = add i64 %t338, 1
  %t340 = call i8* @malloc(i64 %t339)
  %t341 = call i8* @strcpy(i8* %t340, i8* %t332)
  %t342 = call i8* @strcat(i8* %t340, i8* %t334)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t340)
  store double 100.0, double* %outerX.var, align 8
  %t343 = fadd double 100.0, 0.0
  %t344 = bitcast double %t343 to i64
  %t345 = inttoptr i64 %t344 to i8*
  store i8* %t345, i8** @outerX, align 8
  store double 200.0, double* %outerX.1.var, align 8
  %t346 = fadd double 200.0, 0.0
  %t347 = bitcast double %t346 to i64
  %t348 = inttoptr i64 %t347 to i8*
  store i8* %t348, i8** @outerX, align 8
  %t349 = load double, double* %outerX.1.var, align 8
  store double %t349, double* %innerShadow.var, align 8
  %t350 = bitcast double %t349 to i64
  %t351 = inttoptr i64 %t350 to i8*
  store i8* %t351, i8** @innerShadow, align 8
  %t352 = getelementptr inbounds [18 x i8], [18 x i8]* @.str.21, i64 0, i64 0
  %t353 = load double, double* %innerShadow.var, align 8
  %t354 = call i8* @malloc(i64 64)
  %t355 = call i32 (i8*, i8*, ...) @sprintf(i8* %t354, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t353)
  %t356 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.22, i64 0, i64 0
  %t357 = load double, double* %outerX.1.var, align 8
  %t358 = call i8* @malloc(i64 64)
  %t359 = call i32 (i8*, i8*, ...) @sprintf(i8* %t358, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t357)
  %t360 = call i64 @strlen(i8* %t356)
  %t361 = call i64 @strlen(i8* %t358)
  %t362 = add i64 %t360, %t361
  %t363 = add i64 %t362, 1
  %t364 = call i8* @malloc(i64 %t363)
  %t365 = call i8* @strcpy(i8* %t364, i8* %t356)
  %t366 = call i8* @strcat(i8* %t364, i8* %t358)
  %t367 = call i64 @strlen(i8* %t354)
  %t368 = call i64 @strlen(i8* %t364)
  %t369 = add i64 %t367, %t368
  %t370 = add i64 %t369, 1
  %t371 = call i8* @malloc(i64 %t370)
  %t372 = call i8* @strcpy(i8* %t371, i8* %t354)
  %t373 = call i8* @strcat(i8* %t371, i8* %t364)
  %t374 = call i64 @strlen(i8* %t352)
  %t375 = call i64 @strlen(i8* %t371)
  %t376 = add i64 %t374, %t375
  %t377 = add i64 %t376, 1
  %t378 = call i8* @malloc(i64 %t377)
  %t379 = call i8* @strcpy(i8* %t378, i8* %t352)
  %t380 = call i8* @strcat(i8* %t378, i8* %t371)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t378)
  store double 5.0, double* %b1.var, align 8
  store double 12.0, double* %b2.var, align 8
  %t381 = load double, double* %b1.var, align 8
  %t382 = load double, double* %b1.var, align 8
  %t383 = fmul double %t381, %t382
  %t384 = load double, double* %b2.var, align 8
  %t385 = load double, double* %b2.var, align 8
  %t386 = fmul double %t384, %t385
  %t387 = fadd double %t383, %t386
  store double %t387, double* %blockVal.var, align 8
  %t388 = bitcast double %t387 to i64
  %t389 = inttoptr i64 %t388 to i8*
  store i8* %t389, i8** @blockVal, align 8
  %t390 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.23, i64 0, i64 0
  %t391 = load double, double* %blockVal.var, align 8
  %t392 = call i8* @malloc(i64 64)
  %t393 = call i32 (i8*, i8*, ...) @sprintf(i8* %t392, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t391)
  %t394 = call i64 @strlen(i8* %t390)
  %t395 = call i64 @strlen(i8* %t392)
  %t396 = add i64 %t394, %t395
  %t397 = add i64 %t396, 1
  %t398 = call i8* @malloc(i64 %t397)
  %t399 = call i8* @strcpy(i8* %t398, i8* %t390)
  %t400 = call i8* @strcat(i8* %t398, i8* %t392)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t398)
  %t401 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.24, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t401)
  %t402 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.25, i64 0, i64 0
  %t403 = call double @addNumbers(double 20.0, double 35.0)
  %t404 = call i8* @malloc(i64 64)
  %t405 = call i32 (i8*, i8*, ...) @sprintf(i8* %t404, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t403)
  %t406 = call i64 @strlen(i8* %t402)
  %t407 = call i64 @strlen(i8* %t404)
  %t408 = add i64 %t406, %t407
  %t409 = add i64 %t408, 1
  %t410 = call i8* @malloc(i64 %t409)
  %t411 = call i8* @strcpy(i8* %t410, i8* %t402)
  %t412 = call i8* @strcat(i8* %t410, i8* %t404)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t410)
  %t413 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.26, i64 0, i64 0
  %t414 = call double @factorial(double 6.0)
  %t415 = call i8* @malloc(i64 64)
  %t416 = call i32 (i8*, i8*, ...) @sprintf(i8* %t415, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t414)
  %t417 = call i64 @strlen(i8* %t413)
  %t418 = call i64 @strlen(i8* %t415)
  %t419 = add i64 %t417, %t418
  %t420 = add i64 %t419, 1
  %t421 = call i8* @malloc(i64 %t420)
  %t422 = call i8* @strcpy(i8* %t421, i8* %t413)
  %t423 = call i8* @strcat(i8* %t421, i8* %t415)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t421)
  %t424 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.27, i64 0, i64 0
  %t425 = call double @fibonacci(double 10.0)
  %t426 = call i8* @malloc(i64 64)
  %t427 = call i32 (i8*, i8*, ...) @sprintf(i8* %t426, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t425)
  %t428 = call i64 @strlen(i8* %t424)
  %t429 = call i64 @strlen(i8* %t426)
  %t430 = add i64 %t428, %t429
  %t431 = add i64 %t430, 1
  %t432 = call i8* @malloc(i64 %t431)
  %t433 = call i8* @strcpy(i8* %t432, i8* %t424)
  %t434 = call i8* @strcat(i8* %t432, i8* %t426)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t432)
  %t435 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.28, i64 0, i64 0
  %t436 = call i1 @isEven(double 8.0)
  %t437 = call i8* @malloc(i64 64)
  %t438 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t439 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t440 = select i1 %t436, i8* %t438, i8* %t439
  %t441 = call i8* @strcpy(i8* %t437, i8* %t440)
  %t442 = call i64 @strlen(i8* %t435)
  %t443 = call i64 @strlen(i8* %t437)
  %t444 = add i64 %t442, %t443
  %t445 = add i64 %t444, 1
  %t446 = call i8* @malloc(i64 %t445)
  %t447 = call i8* @strcpy(i8* %t446, i8* %t435)
  %t448 = call i8* @strcat(i8* %t446, i8* %t437)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t446)
  %t449 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.29, i64 0, i64 0
  %t450 = call i1 @isOdd(double 8.0)
  %t451 = call i8* @malloc(i64 64)
  %t452 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t453 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t454 = select i1 %t450, i8* %t452, i8* %t453
  %t455 = call i8* @strcpy(i8* %t451, i8* %t454)
  %t456 = call i64 @strlen(i8* %t449)
  %t457 = call i64 @strlen(i8* %t451)
  %t458 = add i64 %t456, %t457
  %t459 = add i64 %t458, 1
  %t460 = call i8* @malloc(i64 %t459)
  %t461 = call i8* @strcpy(i8* %t460, i8* %t449)
  %t462 = call i8* @strcat(i8* %t460, i8* %t451)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t460)
  %t463 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.30, i64 0, i64 0
  %t464 = call double @earlyReturnTest(double 15.0)
  %t465 = call i8* @malloc(i64 64)
  %t466 = call i32 (i8*, i8*, ...) @sprintf(i8* %t465, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t464)
  %t467 = call i64 @strlen(i8* %t463)
  %t468 = call i64 @strlen(i8* %t465)
  %t469 = add i64 %t467, %t468
  %t470 = add i64 %t469, 1
  %t471 = call i8* @malloc(i64 %t470)
  %t472 = call i8* @strcpy(i8* %t471, i8* %t463)
  %t473 = call i8* @strcat(i8* %t471, i8* %t465)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t471)
  %t474 = getelementptr inbounds [43 x i8], [43 x i8]* @.str.31, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t474)
  %t483 = bitcast i8* (i8*)* @.lambda_2 to i8*
  store i8* %t483, i8** %squareFn.var, align 8
  store i8* %t483, i8** @squareFn, align 8
  %t484 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.32, i64 0, i64 0
  %t485 = load i8*, i8** %squareFn.var, align 8
  %t486 = bitcast i8* %t485 to i8* (i8*)*
  %t487 = fadd double 8.0, 0.0
  %t488 = bitcast double %t487 to i64
  %t489 = inttoptr i64 %t488 to i8*
  %t490 = call i8* %t486(i8* %t489)
  %t491 = call i64 @strlen(i8* %t484)
  %t492 = call i64 @strlen(i8* %t490)
  %t493 = add i64 %t491, %t492
  %t494 = add i64 %t493, 1
  %t495 = call i8* @malloc(i64 %t494)
  %t496 = call i8* @strcpy(i8* %t495, i8* %t484)
  %t497 = call i8* @strcat(i8* %t495, i8* %t490)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t495)
  %t505 = bitcast i8* (i8*)* @.lambda_3 to i8*
  %t506 = call double @applyCallback(i8* %t505, double 20.0)
  store double %t506, double* %applied.var, align 8
  %t507 = bitcast double %t506 to i64
  %t508 = inttoptr i64 %t507 to i8*
  store i8* %t508, i8** @applied, align 8
  %t509 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.33, i64 0, i64 0
  %t510 = load double, double* %applied.var, align 8
  %t511 = call i8* @malloc(i64 64)
  %t512 = call i32 (i8*, i8*, ...) @sprintf(i8* %t511, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t510)
  %t513 = call i64 @strlen(i8* %t509)
  %t514 = call i64 @strlen(i8* %t511)
  %t515 = add i64 %t513, %t514
  %t516 = add i64 %t515, 1
  %t517 = call i8* @malloc(i64 %t516)
  %t518 = call i8* @strcpy(i8* %t517, i8* %t509)
  %t519 = call i8* @strcat(i8* %t517, i8* %t511)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t517)
  %t520 = call i8* @makeMultiplier(double 3.0)
  store i8* %t520, i8** %timesThree.var, align 8
  store i8* %t520, i8** @timesThree, align 8
  %t521 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.34, i64 0, i64 0
  %t522 = load i8*, i8** %timesThree.var, align 8
  %t523 = bitcast i8* %t522 to i8* (i8*)*
  %t524 = fadd double 15.0, 0.0
  %t525 = bitcast double %t524 to i64
  %t526 = inttoptr i64 %t525 to i8*
  %t527 = call i8* %t523(i8* %t526)
  %t528 = call i64 @strlen(i8* %t521)
  %t529 = call i64 @strlen(i8* %t527)
  %t530 = add i64 %t528, %t529
  %t531 = add i64 %t530, 1
  %t532 = call i8* @malloc(i64 %t531)
  %t533 = call i8* @strcpy(i8* %t532, i8* %t521)
  %t534 = call i8* @strcat(i8* %t532, i8* %t527)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t532)
  %t535 = getelementptr inbounds [31 x i8], [31 x i8]* @.str.35, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t535)
  store double 10.0, double* %condVal.var, align 8
  %t536 = fadd double 10.0, 0.0
  %t537 = bitcast double %t536 to i64
  %t538 = inttoptr i64 %t537 to i8*
  store i8* %t538, i8** @condVal, align 8
  %t539 = load double, double* %condVal.var, align 8
  %t540 = fcmp ogt double %t539, 0.0
  br i1 %t540, label %then.33, label %else.34
then.33:
  %t541 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.36, i64 0, i64 0
  br label %if.merge.35
else.34:
  %t542 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.37, i64 0, i64 0
  br label %if.merge.35
if.merge.35:
  %t543 = phi i8* [ %t541, %then.33 ], [ %t542, %else.34 ]
  store i8* %t543, i8** %ifResult.var, align 8
  store i8* %t543, i8** @ifResult, align 8
  %t544 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.38, i64 0, i64 0
  %t545 = load i8*, i8** %ifResult.var, align 8
  %t546 = call i64 @strlen(i8* %t544)
  %t547 = call i64 @strlen(i8* %t545)
  %t548 = add i64 %t546, %t547
  %t549 = add i64 %t548, 1
  %t550 = call i8* @malloc(i64 %t549)
  %t551 = call i8* @strcpy(i8* %t550, i8* %t544)
  %t552 = call i8* @strcat(i8* %t550, i8* %t545)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t550)
  %t553 = load double, double* %condVal.var, align 8
  %t554 = fcmp oge double %t553, 10.0
  br i1 %t554, label %then.36, label %else.37
then.36:
  %t555 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.39, i64 0, i64 0
  br label %if.merge.38
else.37:
  %t556 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.40, i64 0, i64 0
  br label %if.merge.38
if.merge.38:
  %t557 = phi i8* [ %t555, %then.36 ], [ %t556, %else.37 ]
  store i8* %t557, i8** %ternResult.var, align 8
  store i8* %t557, i8** @ternResult, align 8
  %t558 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.41, i64 0, i64 0
  %t559 = load i8*, i8** %ternResult.var, align 8
  %t560 = call i64 @strlen(i8* %t558)
  %t561 = call i64 @strlen(i8* %t559)
  %t562 = add i64 %t560, %t561
  %t563 = add i64 %t562, 1
  %t564 = call i8* @malloc(i64 %t563)
  %t565 = call i8* @strcpy(i8* %t564, i8* %t558)
  %t566 = call i8* @strcat(i8* %t564, i8* %t559)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t564)
  store double 1.0, double* %whileIdx.var, align 8
  %t567 = fadd double 1.0, 0.0
  %t568 = bitcast double %t567 to i64
  %t569 = inttoptr i64 %t568 to i8*
  store i8* %t569, i8** @whileIdx, align 8
  store double 0.0, double* %whileSum.var, align 8
  %t570 = fadd double 0.0, 0.0
  %t571 = bitcast double %t570 to i64
  %t572 = inttoptr i64 %t571 to i8*
  store i8* %t572, i8** @whileSum, align 8
  br label %while.cond.39
while.cond.39:
  %t573 = load double, double* %whileIdx.var, align 8
  %t574 = fcmp ole double %t573, 5.0
  br i1 %t574, label %while.body.40, label %while.merge.41
while.body.40:
  %t575 = load double, double* %whileIdx.var, align 8
  %t576 = load double, double* %whileSum.var, align 8
  %t577 = fadd double %t576, %t575
  store double %t577, double* %whileSum.var, align 8
  %t578 = load double, double* %whileIdx.var, align 8
  %t579 = fadd double %t578, 1.0
  store double %t579, double* %whileIdx.var, align 8
  br label %while.cond.39
while.merge.41:
  %t580 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.42, i64 0, i64 0
  %t581 = load double, double* %whileSum.var, align 8
  %t582 = call i8* @malloc(i64 64)
  %t583 = call i32 (i8*, i8*, ...) @sprintf(i8* %t582, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t581)
  %t584 = call i64 @strlen(i8* %t580)
  %t585 = call i64 @strlen(i8* %t582)
  %t586 = add i64 %t584, %t585
  %t587 = add i64 %t586, 1
  %t588 = call i8* @malloc(i64 %t587)
  %t589 = call i8* @strcpy(i8* %t588, i8* %t580)
  %t590 = call i8* @strcat(i8* %t588, i8* %t582)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t588)
  store double 0.0, double* %loopCtr.var, align 8
  %t591 = fadd double 0.0, 0.0
  %t592 = bitcast double %t591 to i64
  %t593 = inttoptr i64 %t592 to i8*
  store i8* %t593, i8** @loopCtr, align 8
  store double 0.0, double* %loopAcc.var, align 8
  %t594 = fadd double 0.0, 0.0
  %t595 = bitcast double %t594 to i64
  %t596 = inttoptr i64 %t595 to i8*
  store i8* %t596, i8** @loopAcc, align 8
  br label %while.cond.42
while.cond.42:
  %t597 = load double, double* %loopCtr.var, align 8
  %t598 = fcmp olt double %t597, 10.0
  br i1 %t598, label %while.body.43, label %while.merge.44
while.body.43:
  %t599 = load double, double* %loopCtr.var, align 8
  %t600 = fadd double %t599, 1.0
  store double %t600, double* %loopCtr.var, align 8
  %t601 = load double, double* %loopCtr.var, align 8
  %t602 = fcmp oeq double %t601, 2.0
  br i1 %t602, label %then.45, label %else.46
then.45:
  br label %while.cond.42
dead.continue.48:
  br label %if.merge.47
else.46:
  br label %if.merge.47
if.merge.47:
  %t603 = load double, double* %loopCtr.var, align 8
  %t604 = fcmp ogt double %t603, 7.0
  br i1 %t604, label %then.49, label %else.50
then.49:
  br label %while.merge.44
dead.break.52:
  br label %if.merge.51
else.50:
  br label %if.merge.51
if.merge.51:
  %t605 = load double, double* %loopCtr.var, align 8
  %t606 = load double, double* %loopAcc.var, align 8
  %t607 = fadd double %t606, %t605
  store double %t607, double* %loopAcc.var, align 8
  br label %while.cond.42
while.merge.44:
  %t608 = getelementptr inbounds [23 x i8], [23 x i8]* @.str.43, i64 0, i64 0
  %t609 = load double, double* %loopAcc.var, align 8
  %t610 = call i8* @malloc(i64 64)
  %t611 = call i32 (i8*, i8*, ...) @sprintf(i8* %t610, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t609)
  %t612 = call i64 @strlen(i8* %t608)
  %t613 = call i64 @strlen(i8* %t610)
  %t614 = add i64 %t612, %t613
  %t615 = add i64 %t614, 1
  %t616 = call i8* @malloc(i64 %t615)
  %t617 = call i8* @strcpy(i8* %t616, i8* %t608)
  %t618 = call i8* @strcat(i8* %t616, i8* %t610)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t616)
  store double 0.0, double* %forSum.var, align 8
  %t619 = fadd double 0.0, 0.0
  %t620 = bitcast double %t619 to i64
  %t621 = inttoptr i64 %t620 to i8*
  store i8* %t621, i8** @forSum, align 8
  store double 0.0, double* %fi.var, align 8
  br label %for.cond.53
for.cond.53:
  %t622 = load double, double* %fi.var, align 8
  %t623 = fcmp olt double %t622, 5.0
  br i1 %t623, label %for.body.54, label %for.merge.56
for.body.54:
  %t624 = load double, double* %fi.var, align 8
  %t625 = fmul double %t624, 3.0
  %t626 = load double, double* %forSum.var, align 8
  %t627 = fadd double %t626, %t625
  store double %t627, double* %forSum.var, align 8
  br label %for.step.55
for.step.55:
  %t628 = load double, double* %fi.var, align 8
  %t629 = fadd double %t628, 1.0
  store double %t629, double* %fi.var, align 8
  br label %for.cond.53
for.merge.56:
  %t630 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.44, i64 0, i64 0
  %t631 = load double, double* %forSum.var, align 8
  %t632 = call i8* @malloc(i64 64)
  %t633 = call i32 (i8*, i8*, ...) @sprintf(i8* %t632, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t631)
  %t634 = call i64 @strlen(i8* %t630)
  %t635 = call i64 @strlen(i8* %t632)
  %t636 = add i64 %t634, %t635
  %t637 = add i64 %t636, 1
  %t638 = call i8* @malloc(i64 %t637)
  %t639 = call i8* @strcpy(i8* %t638, i8* %t630)
  %t640 = call i8* @strcat(i8* %t638, i8* %t632)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t638)
  store double 0.0, double* %gridCount.var, align 8
  %t641 = fadd double 0.0, 0.0
  %t642 = bitcast double %t641 to i64
  %t643 = inttoptr i64 %t642 to i8*
  store i8* %t643, i8** @gridCount, align 8
  store double 0.0, double* %r.var, align 8
  br label %for.cond.57
for.cond.57:
  %t644 = load double, double* %r.var, align 8
  %t645 = fcmp olt double %t644, 3.0
  br i1 %t645, label %for.body.58, label %for.merge.60
for.body.58:
  store double 0.0, double* %c.var, align 8
  br label %for.cond.61
for.cond.61:
  %t646 = load double, double* %c.var, align 8
  %t647 = fcmp olt double %t646, 3.0
  br i1 %t647, label %for.body.62, label %for.merge.64
for.body.62:
  %t648 = load double, double* %gridCount.var, align 8
  %t649 = fadd double %t648, 1.0
  store double %t649, double* %gridCount.var, align 8
  br label %for.step.63
for.step.63:
  %t650 = load double, double* %c.var, align 8
  %t651 = fadd double %t650, 1.0
  store double %t651, double* %c.var, align 8
  br label %for.cond.61
for.merge.64:
  br label %for.step.59
for.step.59:
  %t652 = load double, double* %r.var, align 8
  %t653 = fadd double %t652, 1.0
  store double %t653, double* %r.var, align 8
  br label %for.cond.57
for.merge.60:
  %t654 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.45, i64 0, i64 0
  %t655 = load double, double* %gridCount.var, align 8
  %t656 = call i8* @malloc(i64 64)
  %t657 = call i32 (i8*, i8*, ...) @sprintf(i8* %t656, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t655)
  %t658 = call i64 @strlen(i8* %t654)
  %t659 = call i64 @strlen(i8* %t656)
  %t660 = add i64 %t658, %t659
  %t661 = add i64 %t660, 1
  %t662 = call i8* @malloc(i64 %t661)
  %t663 = call i8* @strcpy(i8* %t662, i8* %t654)
  %t664 = call i8* @strcat(i8* %t662, i8* %t656)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t662)
  store double 3.0, double* %dayCode.var, align 8
  %t665 = fadd double 3.0, 0.0
  %t666 = bitcast double %t665 to i64
  %t667 = inttoptr i64 %t666 to i8*
  store i8* %t667, i8** @dayCode, align 8
  %t668 = load double, double* %dayCode.var, align 8
  br label %switch.cond.66
switch.cond.66:
  %t669 = fcmp oeq double %t668, 1.0
  br i1 %t669, label %switch.body0.67, label %switch.case_next1.68
switch.body0.67:
  %t670 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.46, i64 0, i64 0
  br label %switch.merge.65
switch.case_next1.68:
  %t671 = fcmp oeq double %t668, 2.0
  br i1 %t671, label %switch.body1.69, label %switch.case_next2.70
switch.body1.69:
  %t672 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.47, i64 0, i64 0
  br label %switch.merge.65
switch.case_next2.70:
  %t673 = fcmp oeq double %t668, 3.0
  br i1 %t673, label %switch.body2.71, label %switch.case_next3.72
switch.body2.71:
  %t674 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.48, i64 0, i64 0
  br label %switch.merge.65
switch.case_next3.72:
  %t675 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.49, i64 0, i64 0
  br label %switch.merge.65
switch.merge.65:
  %t676 = phi i8* [ %t670, %switch.body0.67 ], [ %t672, %switch.body1.69 ], [ %t674, %switch.body2.71 ], [ %t675, %switch.case_next3.72 ]
  store i8* %t676, i8** %dayName.var, align 8
  store i8* %t676, i8** @dayName, align 8
  %t677 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.50, i64 0, i64 0
  %t678 = load i8*, i8** %dayName.var, align 8
  %t679 = call i64 @strlen(i8* %t677)
  %t680 = call i64 @strlen(i8* %t678)
  %t681 = add i64 %t679, %t680
  %t682 = add i64 %t681, 1
  %t683 = call i8* @malloc(i64 %t682)
  %t684 = call i8* @strcpy(i8* %t683, i8* %t677)
  %t685 = call i8* @strcat(i8* %t683, i8* %t678)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t683)
  %t686 = getelementptr inbounds [29 x i8], [29 x i8]* @.str.51, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t686)
  %t687 = call i8* @malloc(i64 40)
  %t688 = bitcast i8* %t687 to i64*
  store i64 2, i64* %t688, align 8
  %t689 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.52, i64 0, i64 0
  %t690 = fadd double 10.0, 0.0
  %t691 = bitcast double %t690 to i64
  %t692 = inttoptr i64 %t691 to i8*
  %t693 = getelementptr inbounds i8, i8* %t687, i64 8
  %t694 = bitcast i8* %t693 to i8**
  store i8* %t689, i8** %t694, align 8
  %t695 = getelementptr inbounds i8, i8* %t687, i64 16
  %t696 = bitcast i8* %t695 to i8**
  store i8* %t692, i8** %t696, align 8
  %t697 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t698 = fadd double 20.0, 0.0
  %t699 = bitcast double %t698 to i64
  %t700 = inttoptr i64 %t699 to i8*
  %t701 = getelementptr inbounds i8, i8* %t687, i64 24
  %t702 = bitcast i8* %t701 to i8**
  store i8* %t697, i8** %t702, align 8
  %t703 = getelementptr inbounds i8, i8* %t687, i64 32
  %t704 = bitcast i8* %t703 to i8**
  store i8* %t700, i8** %t704, align 8
  store i8* %t687, i8** %pt.var, align 8
  store i8* %t687, i8** @pt, align 8
  %t705 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.54, i64 0, i64 0
  %t706 = load i8*, i8** %pt.var, align 8
  %t707 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.52, i64 0, i64 0
  %t708 = call i8* @_tl_record_get(i8* %t706, i8* %t707)
  %t709 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.55, i64 0, i64 0
  %t710 = load i8*, i8** %pt.var, align 8
  %t711 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t712 = call i8* @_tl_record_get(i8* %t710, i8* %t711)
  %t713 = call i64 @strlen(i8* %t709)
  %t714 = call i64 @strlen(i8* %t712)
  %t715 = add i64 %t713, %t714
  %t716 = add i64 %t715, 1
  %t717 = call i8* @malloc(i64 %t716)
  %t718 = call i8* @strcpy(i8* %t717, i8* %t709)
  %t719 = call i8* @strcat(i8* %t717, i8* %t712)
  %t720 = call i64 @strlen(i8* %t708)
  %t721 = call i64 @strlen(i8* %t717)
  %t722 = add i64 %t720, %t721
  %t723 = add i64 %t722, 1
  %t724 = call i8* @malloc(i64 %t723)
  %t725 = call i8* @strcpy(i8* %t724, i8* %t708)
  %t726 = call i8* @strcat(i8* %t724, i8* %t717)
  %t727 = call i64 @strlen(i8* %t705)
  %t728 = call i64 @strlen(i8* %t724)
  %t729 = add i64 %t727, %t728
  %t730 = add i64 %t729, 1
  %t731 = call i8* @malloc(i64 %t730)
  %t732 = call i8* @strcpy(i8* %t731, i8* %t705)
  %t733 = call i8* @strcat(i8* %t731, i8* %t724)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t731)
  %t734 = call i8* @malloc(i64 24)
  %t735 = bitcast i8* %t734 to i64*
  store i64 1, i64* %t735, align 8
  %t736 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.56, i64 0, i64 0
  %t737 = call i8* @malloc(i64 40)
  %t738 = bitcast i8* %t737 to i64*
  store i64 2, i64* %t738, align 8
  %t739 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.57, i64 0, i64 0
  %t740 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.58, i64 0, i64 0
  %t741 = getelementptr inbounds i8, i8* %t737, i64 8
  %t742 = bitcast i8* %t741 to i8**
  store i8* %t739, i8** %t742, align 8
  %t743 = getelementptr inbounds i8, i8* %t737, i64 16
  %t744 = bitcast i8* %t743 to i8**
  store i8* %t740, i8** %t744, align 8
  %t745 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.59, i64 0, i64 0
  %t746 = fadd double 8080.0, 0.0
  %t747 = bitcast double %t746 to i64
  %t748 = inttoptr i64 %t747 to i8*
  %t749 = getelementptr inbounds i8, i8* %t737, i64 24
  %t750 = bitcast i8* %t749 to i8**
  store i8* %t745, i8** %t750, align 8
  %t751 = getelementptr inbounds i8, i8* %t737, i64 32
  %t752 = bitcast i8* %t751 to i8**
  store i8* %t748, i8** %t752, align 8
  %t753 = getelementptr inbounds i8, i8* %t734, i64 8
  %t754 = bitcast i8* %t753 to i8**
  store i8* %t736, i8** %t754, align 8
  %t755 = getelementptr inbounds i8, i8* %t734, i64 16
  %t756 = bitcast i8* %t755 to i8**
  store i8* %t737, i8** %t756, align 8
  store i8* %t734, i8** %cfg.var, align 8
  store i8* %t734, i8** @cfg, align 8
  %t757 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.60, i64 0, i64 0
  %t758 = load i8*, i8** %cfg.var, align 8
  %t759 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.56, i64 0, i64 0
  %t760 = call i8* @_tl_record_get(i8* %t758, i8* %t759)
  %t761 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.57, i64 0, i64 0
  %t762 = call i8* @_tl_record_get(i8* %t760, i8* %t761)
  %t763 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.61, i64 0, i64 0
  %t764 = load i8*, i8** %cfg.var, align 8
  %t765 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.56, i64 0, i64 0
  %t766 = call i8* @_tl_record_get(i8* %t764, i8* %t765)
  %t767 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.59, i64 0, i64 0
  %t768 = call i8* @_tl_record_get(i8* %t766, i8* %t767)
  %t769 = call i64 @strlen(i8* %t763)
  %t770 = call i64 @strlen(i8* %t768)
  %t771 = add i64 %t769, %t770
  %t772 = add i64 %t771, 1
  %t773 = call i8* @malloc(i64 %t772)
  %t774 = call i8* @strcpy(i8* %t773, i8* %t763)
  %t775 = call i8* @strcat(i8* %t773, i8* %t768)
  %t776 = call i64 @strlen(i8* %t762)
  %t777 = call i64 @strlen(i8* %t773)
  %t778 = add i64 %t776, %t777
  %t779 = add i64 %t778, 1
  %t780 = call i8* @malloc(i64 %t779)
  %t781 = call i8* @strcpy(i8* %t780, i8* %t762)
  %t782 = call i8* @strcat(i8* %t780, i8* %t773)
  %t783 = call i64 @strlen(i8* %t757)
  %t784 = call i64 @strlen(i8* %t780)
  %t785 = add i64 %t783, %t784
  %t786 = add i64 %t785, 1
  %t787 = call i8* @malloc(i64 %t786)
  %t788 = call i8* @strcpy(i8* %t787, i8* %t757)
  %t789 = call i8* @strcat(i8* %t787, i8* %t780)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t787)
  %t790 = call i8* @malloc(i64 40)
  %t791 = bitcast i8* %t790 to i64*
  store i64 2, i64* %t791, align 8
  %t792 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.52, i64 0, i64 0
  %t793 = fadd double 10.0, 0.0
  %t794 = bitcast double %t793 to i64
  %t795 = inttoptr i64 %t794 to i8*
  %t796 = getelementptr inbounds i8, i8* %t790, i64 8
  %t797 = bitcast i8* %t796 to i8**
  store i8* %t792, i8** %t797, align 8
  %t798 = getelementptr inbounds i8, i8* %t790, i64 16
  %t799 = bitcast i8* %t798 to i8**
  store i8* %t795, i8** %t799, align 8
  %t800 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t801 = fadd double 20.0, 0.0
  %t802 = bitcast double %t801 to i64
  %t803 = inttoptr i64 %t802 to i8*
  %t804 = getelementptr inbounds i8, i8* %t790, i64 24
  %t805 = bitcast i8* %t804 to i8**
  store i8* %t800, i8** %t805, align 8
  %t806 = getelementptr inbounds i8, i8* %t790, i64 32
  %t807 = bitcast i8* %t806 to i8**
  store i8* %t803, i8** %t807, align 8
  store i8* %t790, i8** %origPt.var, align 8
  store i8* %t790, i8** @origPt, align 8
  %t808 = call i8* @malloc(i64 88)
  %t809 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t810 = fadd double 99.0, 0.0
  %t811 = bitcast double %t810 to i64
  %t812 = inttoptr i64 %t811 to i8*
  %t813 = getelementptr inbounds i8, i8* %t808, i64 8
  %t814 = bitcast i8* %t813 to i8**
  store i8* %t809, i8** %t814, align 8
  %t815 = getelementptr inbounds i8, i8* %t808, i64 16
  %t816 = bitcast i8* %t815 to i8**
  store i8* %t812, i8** %t816, align 8
  store i8* %t808, i8** %modPt.var, align 8
  store i8* %t808, i8** @modPt, align 8
  %t817 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.62, i64 0, i64 0
  %t818 = load i8*, i8** %origPt.var, align 8
  %t819 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t820 = call i8* @_tl_record_get(i8* %t818, i8* %t819)
  %t821 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.63, i64 0, i64 0
  %t822 = load i8*, i8** %modPt.var, align 8
  %t823 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.53, i64 0, i64 0
  %t824 = call i8* @_tl_record_get(i8* %t822, i8* %t823)
  %t825 = call i64 @strlen(i8* %t821)
  %t826 = call i64 @strlen(i8* %t824)
  %t827 = add i64 %t825, %t826
  %t828 = add i64 %t827, 1
  %t829 = call i8* @malloc(i64 %t828)
  %t830 = call i8* @strcpy(i8* %t829, i8* %t821)
  %t831 = call i8* @strcat(i8* %t829, i8* %t824)
  %t832 = call i64 @strlen(i8* %t820)
  %t833 = call i64 @strlen(i8* %t829)
  %t834 = add i64 %t832, %t833
  %t835 = add i64 %t834, 1
  %t836 = call i8* @malloc(i64 %t835)
  %t837 = call i8* @strcpy(i8* %t836, i8* %t820)
  %t838 = call i8* @strcat(i8* %t836, i8* %t829)
  %t839 = call i64 @strlen(i8* %t817)
  %t840 = call i64 @strlen(i8* %t836)
  %t841 = add i64 %t839, %t840
  %t842 = add i64 %t841, 1
  %t843 = call i8* @malloc(i64 %t842)
  %t844 = call i8* @strcpy(i8* %t843, i8* %t817)
  %t845 = call i8* @strcat(i8* %t843, i8* %t836)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t843)
  %t846 = getelementptr inbounds [26 x i8], [26 x i8]* @.str.64, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t846)
  %t847 = call i8* @malloc(i64 16)
  %t848 = bitcast i8* %t847 to %struct.Array*
  %t849 = getelementptr inbounds %struct.Array, %struct.Array* %t848, i32 0, i32 0
  store i64 2, i64* %t849, align 8
  %t850 = call i8* @malloc(i64 16)
  %t851 = fadd double 100.0, 0.0
  %t852 = bitcast double %t851 to i64
  %t853 = inttoptr i64 %t852 to i8*
  %t854 = getelementptr inbounds i8, i8* %t850, i64 0
  %t855 = bitcast i8* %t854 to i8**
  store i8* %t853, i8** %t855, align 8
  %t856 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.65, i64 0, i64 0
  %t857 = getelementptr inbounds i8, i8* %t850, i64 8
  %t858 = bitcast i8* %t857 to i8**
  store i8* %t856, i8** %t858, align 8
  %t859 = getelementptr inbounds %struct.Array, %struct.Array* %t848, i32 0, i32 1
  %t860 = bitcast i8* %t850 to i8**
  store i8** %t860, i8*** %t859, align 8
  store %struct.Array* %t848, %struct.Array** %pairTup.var, align 8
  %t861 = bitcast %struct.Array* %t848 to i8*
  store i8* %t861, i8** @pairTup, align 8
  %t862 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.66, i64 0, i64 0
  %t863 = load %struct.Array*, %struct.Array** %pairTup.var, align 8
  %t864 = fptosi double 0.0 to i64
  %t865 = getelementptr inbounds %struct.Array, %struct.Array* %t863, i32 0, i32 1
  %t866 = load i8**, i8*** %t865, align 8
  %t867 = getelementptr inbounds i8*, i8** %t866, i64 %t864
  %t868 = load i8*, i8** %t867, align 8
  %t869 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.67, i64 0, i64 0
  %t870 = load %struct.Array*, %struct.Array** %pairTup.var, align 8
  %t871 = fptosi double 1.0 to i64
  %t872 = getelementptr inbounds %struct.Array, %struct.Array* %t870, i32 0, i32 1
  %t873 = load i8**, i8*** %t872, align 8
  %t874 = getelementptr inbounds i8*, i8** %t873, i64 %t871
  %t875 = load i8*, i8** %t874, align 8
  %t876 = call i64 @strlen(i8* %t869)
  %t877 = call i64 @strlen(i8* %t875)
  %t878 = add i64 %t876, %t877
  %t879 = add i64 %t878, 1
  %t880 = call i8* @malloc(i64 %t879)
  %t881 = call i8* @strcpy(i8* %t880, i8* %t869)
  %t882 = call i8* @strcat(i8* %t880, i8* %t875)
  %t883 = call i64 @strlen(i8* %t868)
  %t884 = call i64 @strlen(i8* %t880)
  %t885 = add i64 %t883, %t884
  %t886 = add i64 %t885, 1
  %t887 = call i8* @malloc(i64 %t886)
  %t888 = call i8* @strcpy(i8* %t887, i8* %t868)
  %t889 = call i8* @strcat(i8* %t887, i8* %t880)
  %t890 = call i64 @strlen(i8* %t862)
  %t891 = call i64 @strlen(i8* %t887)
  %t892 = add i64 %t890, %t891
  %t893 = add i64 %t892, 1
  %t894 = call i8* @malloc(i64 %t893)
  %t895 = call i8* @strcpy(i8* %t894, i8* %t862)
  %t896 = call i8* @strcat(i8* %t894, i8* %t887)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t894)
  %t897 = call i8* @divRem(double 17.0, double 5.0)
  store i8* %t897, i8** %dr.var, align 8
  store i8* %t897, i8** @dr, align 8
  %t898 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.68, i64 0, i64 0
  %t899 = load i8*, i8** %dr.var, align 8
  %t900 = fptosi double 0.0 to i64
  %t901 = bitcast i8* %t899 to %struct.Array*
  %t902 = getelementptr inbounds %struct.Array, %struct.Array* %t901, i32 0, i32 1
  %t903 = load i8**, i8*** %t902, align 8
  %t904 = getelementptr inbounds i8*, i8** %t903, i64 %t900
  %t905 = load i8*, i8** %t904, align 8
  %t906 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.69, i64 0, i64 0
  %t907 = load i8*, i8** %dr.var, align 8
  %t908 = fptosi double 1.0 to i64
  %t909 = bitcast i8* %t907 to %struct.Array*
  %t910 = getelementptr inbounds %struct.Array, %struct.Array* %t909, i32 0, i32 1
  %t911 = load i8**, i8*** %t910, align 8
  %t912 = getelementptr inbounds i8*, i8** %t911, i64 %t908
  %t913 = load i8*, i8** %t912, align 8
  %t914 = call i64 @strlen(i8* %t906)
  %t915 = call i64 @strlen(i8* %t913)
  %t916 = add i64 %t914, %t915
  %t917 = add i64 %t916, 1
  %t918 = call i8* @malloc(i64 %t917)
  %t919 = call i8* @strcpy(i8* %t918, i8* %t906)
  %t920 = call i8* @strcat(i8* %t918, i8* %t913)
  %t921 = call i64 @strlen(i8* %t905)
  %t922 = call i64 @strlen(i8* %t918)
  %t923 = add i64 %t921, %t922
  %t924 = add i64 %t923, 1
  %t925 = call i8* @malloc(i64 %t924)
  %t926 = call i8* @strcpy(i8* %t925, i8* %t905)
  %t927 = call i8* @strcat(i8* %t925, i8* %t918)
  %t928 = call i64 @strlen(i8* %t898)
  %t929 = call i64 @strlen(i8* %t925)
  %t930 = add i64 %t928, %t929
  %t931 = add i64 %t930, 1
  %t932 = call i8* @malloc(i64 %t931)
  %t933 = call i8* @strcpy(i8* %t932, i8* %t898)
  %t934 = call i8* @strcat(i8* %t932, i8* %t925)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t932)
  %t935 = call i8* @malloc(i64 16)
  %t936 = bitcast i8* %t935 to %struct.Array*
  %t937 = getelementptr inbounds %struct.Array, %struct.Array* %t936, i32 0, i32 0
  store i64 4, i64* %t937, align 8
  %t938 = call i8* @malloc(i64 32)
  %t939 = fadd double 10.0, 0.0
  %t940 = bitcast double %t939 to i64
  %t941 = inttoptr i64 %t940 to i8*
  %t942 = getelementptr inbounds i8, i8* %t938, i64 0
  %t943 = bitcast i8* %t942 to i8**
  store i8* %t941, i8** %t943, align 8
  %t944 = fadd double 20.0, 0.0
  %t945 = bitcast double %t944 to i64
  %t946 = inttoptr i64 %t945 to i8*
  %t947 = getelementptr inbounds i8, i8* %t938, i64 8
  %t948 = bitcast i8* %t947 to i8**
  store i8* %t946, i8** %t948, align 8
  %t949 = fadd double 30.0, 0.0
  %t950 = bitcast double %t949 to i64
  %t951 = inttoptr i64 %t950 to i8*
  %t952 = getelementptr inbounds i8, i8* %t938, i64 16
  %t953 = bitcast i8* %t952 to i8**
  store i8* %t951, i8** %t953, align 8
  %t954 = fadd double 40.0, 0.0
  %t955 = bitcast double %t954 to i64
  %t956 = inttoptr i64 %t955 to i8*
  %t957 = getelementptr inbounds i8, i8* %t938, i64 24
  %t958 = bitcast i8* %t957 to i8**
  store i8* %t956, i8** %t958, align 8
  %t959 = getelementptr inbounds %struct.Array, %struct.Array* %t936, i32 0, i32 1
  %t960 = bitcast i8* %t938 to i8**
  store i8** %t960, i8*** %t959, align 8
  store %struct.Array* %t936, %struct.Array** %sampleArr.var, align 8
  %t961 = bitcast %struct.Array* %t936 to i8*
  store i8* %t961, i8** @sampleArr, align 8
  %t962 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.70, i64 0, i64 0
  %t963 = load %struct.Array*, %struct.Array** %sampleArr.var, align 8
  %t964 = fptosi double 2.0 to i64
  %t965 = getelementptr inbounds %struct.Array, %struct.Array* %t963, i32 0, i32 1
  %t966 = load i8**, i8*** %t965, align 8
  %t967 = getelementptr inbounds i8*, i8** %t966, i64 %t964
  %t968 = load i8*, i8** %t967, align 8
  %t969 = call i64 @strlen(i8* %t962)
  %t970 = call i64 @strlen(i8* %t968)
  %t971 = add i64 %t969, %t970
  %t972 = add i64 %t971, 1
  %t973 = call i8* @malloc(i64 %t972)
  %t974 = call i8* @strcpy(i8* %t973, i8* %t962)
  %t975 = call i8* @strcat(i8* %t973, i8* %t968)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t973)
  %t976 = getelementptr inbounds [39 x i8], [39 x i8]* @.str.71, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t976)
  %t977 = call i8* @malloc(i64 16)
  %t978 = bitcast i8* %t977 to %struct.GADTValue*
  %t979 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t978, i32 0, i32 0
  store i32 1, i32* %t979, align 4
  %t980 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t978, i32 0, i32 1
  store i8* null, i8** %t980, align 8
  store %struct.GADTValue* %t978, %struct.GADTValue** %col.var, align 8
  %t981 = bitcast %struct.GADTValue* %t978 to i8*
  store i8* %t981, i8** @col, align 8
  %t982 = load %struct.GADTValue*, %struct.GADTValue** %col.var, align 8
  %t984 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t982, i32 0, i32 0
  %t983 = load i32, i32* %t984, align 4
  switch i32 %t983, label %match.default.73 [ i32 0, label %match.arm0.75 i32 1, label %match.arm1.76 i32 2, label %match.arm2.77 ]
match.arm0.75:
  %t985 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.72, i64 0, i64 0
  br label %match.merge.74
match.arm1.76:
  %t986 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.73, i64 0, i64 0
  br label %match.merge.74
match.arm2.77:
  %t987 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.74, i64 0, i64 0
  br label %match.merge.74
match.default.73:
  br label %match.merge.74
match.merge.74:
  %t988 = phi i8* [ %t985, %match.arm0.75 ], [ %t986, %match.arm1.76 ], [ %t987, %match.arm2.77 ], [ null, %match.default.73 ]
  store i8* %t988, i8** %colStr.var, align 8
  store i8* %t988, i8** @colStr, align 8
  %t989 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.75, i64 0, i64 0
  %t990 = load i8*, i8** %colStr.var, align 8
  %t991 = call i64 @strlen(i8* %t989)
  %t992 = call i64 @strlen(i8* %t990)
  %t993 = add i64 %t991, %t992
  %t994 = add i64 %t993, 1
  %t995 = call i8* @malloc(i64 %t994)
  %t996 = call i8* @strcpy(i8* %t995, i8* %t989)
  %t997 = call i8* @strcat(i8* %t995, i8* %t990)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t995)
  %t998 = call i8* @malloc(i64 16)
  %t999 = bitcast i8* %t998 to %struct.GADTValue*
  %t1000 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t999, i32 0, i32 0
  store i32 0, i32* %t1000, align 4
  %t1001 = call i8* @malloc(i64 8)
  %t1002 = fadd double 42.0, 0.0
  %t1003 = bitcast double %t1002 to i64
  %t1004 = inttoptr i64 %t1003 to i8*
  %t1005 = getelementptr inbounds i8, i8* %t1001, i64 0
  %t1006 = bitcast i8* %t1005 to i8**
  store i8* %t1004, i8** %t1006, align 8
  %t1007 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t999, i32 0, i32 1
  store i8* %t1001, i8** %t1007, align 8
  store %struct.GADTValue* %t999, %struct.GADTValue** %mb.var, align 8
  %t1008 = bitcast %struct.GADTValue* %t999 to i8*
  store i8* %t1008, i8** @mb, align 8
  %t1009 = load %struct.GADTValue*, %struct.GADTValue** %mb.var, align 8
  %t1011 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1009, i32 0, i32 0
  %t1010 = load i32, i32* %t1011, align 4
  switch i32 %t1010, label %match.default.78 [ i32 0, label %match.arm0.80 i32 1, label %match.arm1.81 ]
match.arm0.80:
  %t1012 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1009, i32 0, i32 1
  %t1013 = load i8*, i8** %t1012, align 8
  %t1014 = getelementptr inbounds i8, i8* %t1013, i64 0
  %t1015 = bitcast i8* %t1014 to i8**
  %t1016 = load i8*, i8** %t1015, align 8
  store i8* %t1016, i8** %t1017, align 8
  %t1018 = load i8*, i8** %t1017, align 8
  %t1020 = ptrtoint i8* %t1018 to i64
  %t1019 = bitcast i64 %t1020 to double
  br label %match.merge.79
match.arm1.81:
  br label %match.merge.79
match.default.78:
  br label %match.merge.79
match.merge.79:
  %t1022 = phi double [ %t1019, %match.arm0.80 ], [ 0.0, %match.arm1.81 ], [ 0.0, %match.default.78 ]
  store double %t1022, double* %mbVal.var, align 8
  %t1023 = bitcast double %t1022 to i64
  %t1024 = inttoptr i64 %t1023 to i8*
  store i8* %t1024, i8** @mbVal, align 8
  %t1025 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.76, i64 0, i64 0
  %t1026 = load double, double* %mbVal.var, align 8
  %t1027 = call i8* @malloc(i64 64)
  %t1028 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1027, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1026)
  %t1029 = call i64 @strlen(i8* %t1025)
  %t1030 = call i64 @strlen(i8* %t1027)
  %t1031 = add i64 %t1029, %t1030
  %t1032 = add i64 %t1031, 1
  %t1033 = call i8* @malloc(i64 %t1032)
  %t1034 = call i8* @strcpy(i8* %t1033, i8* %t1025)
  %t1035 = call i8* @strcat(i8* %t1033, i8* %t1027)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1033)
  %t1036 = call i8* @malloc(i64 16)
  %t1037 = bitcast i8* %t1036 to %struct.GADTValue*
  %t1038 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1037, i32 0, i32 0
  store i32 1, i32* %t1038, align 4
  %t1039 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1037, i32 0, i32 1
  store i8* null, i8** %t1039, align 8
  %t1040 = call i8* @malloc(i64 16)
  %t1041 = bitcast i8* %t1040 to %struct.GADTValue*
  %t1042 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1041, i32 0, i32 0
  store i32 0, i32* %t1042, align 4
  %t1043 = call i8* @malloc(i64 16)
  %t1044 = fadd double 30.0, 0.0
  %t1045 = bitcast double %t1044 to i64
  %t1046 = inttoptr i64 %t1045 to i8*
  %t1047 = getelementptr inbounds i8, i8* %t1043, i64 0
  %t1048 = bitcast i8* %t1047 to i8**
  store i8* %t1046, i8** %t1048, align 8
  %t1049 = bitcast %struct.GADTValue* %t1037 to i8*
  %t1050 = getelementptr inbounds i8, i8* %t1043, i64 8
  %t1051 = bitcast i8* %t1050 to i8**
  store i8* %t1049, i8** %t1051, align 8
  %t1052 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1041, i32 0, i32 1
  store i8* %t1043, i8** %t1052, align 8
  %t1053 = call i8* @malloc(i64 16)
  %t1054 = bitcast i8* %t1053 to %struct.GADTValue*
  %t1055 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1054, i32 0, i32 0
  store i32 0, i32* %t1055, align 4
  %t1056 = call i8* @malloc(i64 16)
  %t1057 = fadd double 20.0, 0.0
  %t1058 = bitcast double %t1057 to i64
  %t1059 = inttoptr i64 %t1058 to i8*
  %t1060 = getelementptr inbounds i8, i8* %t1056, i64 0
  %t1061 = bitcast i8* %t1060 to i8**
  store i8* %t1059, i8** %t1061, align 8
  %t1062 = bitcast %struct.GADTValue* %t1041 to i8*
  %t1063 = getelementptr inbounds i8, i8* %t1056, i64 8
  %t1064 = bitcast i8* %t1063 to i8**
  store i8* %t1062, i8** %t1064, align 8
  %t1065 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1054, i32 0, i32 1
  store i8* %t1056, i8** %t1065, align 8
  %t1066 = call i8* @malloc(i64 16)
  %t1067 = bitcast i8* %t1066 to %struct.GADTValue*
  %t1068 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1067, i32 0, i32 0
  store i32 0, i32* %t1068, align 4
  %t1069 = call i8* @malloc(i64 16)
  %t1070 = fadd double 10.0, 0.0
  %t1071 = bitcast double %t1070 to i64
  %t1072 = inttoptr i64 %t1071 to i8*
  %t1073 = getelementptr inbounds i8, i8* %t1069, i64 0
  %t1074 = bitcast i8* %t1073 to i8**
  store i8* %t1072, i8** %t1074, align 8
  %t1075 = bitcast %struct.GADTValue* %t1054 to i8*
  %t1076 = getelementptr inbounds i8, i8* %t1069, i64 8
  %t1077 = bitcast i8* %t1076 to i8**
  store i8* %t1075, i8** %t1077, align 8
  %t1078 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1067, i32 0, i32 1
  store i8* %t1069, i8** %t1078, align 8
  store %struct.GADTValue* %t1067, %struct.GADTValue** %intList.var, align 8
  %t1079 = bitcast %struct.GADTValue* %t1067 to i8*
  store i8* %t1079, i8** @intList, align 8
  %t1080 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.77, i64 0, i64 0
  %t1081 = load %struct.GADTValue*, %struct.GADTValue** %intList.var, align 8
  %t1082 = call double @sumList(%struct.GADTValue* %t1081)
  %t1083 = call i8* @malloc(i64 64)
  %t1084 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1083, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1082)
  %t1085 = call i64 @strlen(i8* %t1080)
  %t1086 = call i64 @strlen(i8* %t1083)
  %t1087 = add i64 %t1085, %t1086
  %t1088 = add i64 %t1087, 1
  %t1089 = call i8* @malloc(i64 %t1088)
  %t1090 = call i8* @strcpy(i8* %t1089, i8* %t1080)
  %t1091 = call i8* @strcat(i8* %t1089, i8* %t1083)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1089)
  %t1092 = call i8* @malloc(i64 16)
  %t1093 = bitcast i8* %t1092 to %struct.GADTValue*
  %t1094 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1093, i32 0, i32 0
  store i32 0, i32* %t1094, align 4
  %t1095 = call i8* @malloc(i64 8)
  %t1096 = fadd double 10.0, 0.0
  %t1097 = bitcast double %t1096 to i64
  %t1098 = inttoptr i64 %t1097 to i8*
  %t1099 = getelementptr inbounds i8, i8* %t1095, i64 0
  %t1100 = bitcast i8* %t1099 to i8**
  store i8* %t1098, i8** %t1100, align 8
  %t1101 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1093, i32 0, i32 1
  store i8* %t1095, i8** %t1101, align 8
  %t1102 = call i8* @malloc(i64 16)
  %t1103 = bitcast i8* %t1102 to %struct.GADTValue*
  %t1104 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1103, i32 0, i32 0
  store i32 0, i32* %t1104, align 4
  %t1105 = call i8* @malloc(i64 8)
  %t1106 = fadd double 7.0, 0.0
  %t1107 = bitcast double %t1106 to i64
  %t1108 = inttoptr i64 %t1107 to i8*
  %t1109 = getelementptr inbounds i8, i8* %t1105, i64 0
  %t1110 = bitcast i8* %t1109 to i8**
  store i8* %t1108, i8** %t1110, align 8
  %t1111 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1103, i32 0, i32 1
  store i8* %t1105, i8** %t1111, align 8
  %t1112 = call i8* @malloc(i64 16)
  %t1113 = bitcast i8* %t1112 to %struct.GADTValue*
  %t1114 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1113, i32 0, i32 0
  store i32 0, i32* %t1114, align 4
  %t1115 = call i8* @malloc(i64 8)
  %t1116 = fadd double 8.0, 0.0
  %t1117 = bitcast double %t1116 to i64
  %t1118 = inttoptr i64 %t1117 to i8*
  %t1119 = getelementptr inbounds i8, i8* %t1115, i64 0
  %t1120 = bitcast i8* %t1119 to i8**
  store i8* %t1118, i8** %t1120, align 8
  %t1121 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1113, i32 0, i32 1
  store i8* %t1115, i8** %t1121, align 8
  %t1122 = call i8* @malloc(i64 16)
  %t1123 = bitcast i8* %t1122 to %struct.GADTValue*
  %t1124 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1123, i32 0, i32 0
  store i32 1, i32* %t1124, align 4
  %t1125 = call i8* @malloc(i64 16)
  %t1126 = bitcast %struct.GADTValue* %t1103 to i8*
  %t1127 = getelementptr inbounds i8, i8* %t1125, i64 0
  %t1128 = bitcast i8* %t1127 to i8**
  store i8* %t1126, i8** %t1128, align 8
  %t1129 = bitcast %struct.GADTValue* %t1113 to i8*
  %t1130 = getelementptr inbounds i8, i8* %t1125, i64 8
  %t1131 = bitcast i8* %t1130 to i8**
  store i8* %t1129, i8** %t1131, align 8
  %t1132 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1123, i32 0, i32 1
  store i8* %t1125, i8** %t1132, align 8
  %t1133 = call i8* @malloc(i64 16)
  %t1134 = bitcast i8* %t1133 to %struct.GADTValue*
  %t1135 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1134, i32 0, i32 0
  store i32 1, i32* %t1135, align 4
  %t1136 = call i8* @malloc(i64 16)
  %t1137 = bitcast %struct.GADTValue* %t1093 to i8*
  %t1138 = getelementptr inbounds i8, i8* %t1136, i64 0
  %t1139 = bitcast i8* %t1138 to i8**
  store i8* %t1137, i8** %t1139, align 8
  %t1140 = bitcast %struct.GADTValue* %t1123 to i8*
  %t1141 = getelementptr inbounds i8, i8* %t1136, i64 8
  %t1142 = bitcast i8* %t1141 to i8**
  store i8* %t1140, i8** %t1142, align 8
  %t1143 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1134, i32 0, i32 1
  store i8* %t1136, i8** %t1143, align 8
  store %struct.GADTValue* %t1134, %struct.GADTValue** %astTree.var, align 8
  %t1144 = bitcast %struct.GADTValue* %t1134 to i8*
  store i8* %t1144, i8** @astTree, align 8
  %t1145 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.78, i64 0, i64 0
  %t1146 = load %struct.GADTValue*, %struct.GADTValue** %astTree.var, align 8
  %t1147 = call double @evaluateAST(%struct.GADTValue* %t1146)
  %t1148 = call i8* @malloc(i64 64)
  %t1149 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1148, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1147)
  %t1150 = call i64 @strlen(i8* %t1145)
  %t1151 = call i64 @strlen(i8* %t1148)
  %t1152 = add i64 %t1150, %t1151
  %t1153 = add i64 %t1152, 1
  %t1154 = call i8* @malloc(i64 %t1153)
  %t1155 = call i8* @strcpy(i8* %t1154, i8* %t1145)
  %t1156 = call i8* @strcat(i8* %t1154, i8* %t1148)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1154)
  %t1157 = getelementptr inbounds [28 x i8], [28 x i8]* @.str.79, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1157)
  store double 2.0, double* %matchNum.var, align 8
  %t1158 = fadd double 2.0, 0.0
  %t1159 = bitcast double %t1158 to i64
  %t1160 = inttoptr i64 %t1159 to i8*
  store i8* %t1160, i8** @matchNum, align 8
  %t1161 = load double, double* %matchNum.var, align 8
  switch i32 0, label %match.arm2.86 [ i32 0, label %match.arm0.84 i32 1, label %match.arm1.85 ]
match.arm0.84:
  %t1163 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.80, i64 0, i64 0
  br label %match.merge.83
match.arm1.85:
  %t1164 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.81, i64 0, i64 0
  br label %match.merge.83
match.arm2.86:
  %t1165 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.49, i64 0, i64 0
  br label %match.merge.83
match.merge.83:
  %t1166 = phi i8* [ %t1163, %match.arm0.84 ], [ %t1164, %match.arm1.85 ], [ %t1165, %match.arm2.86 ]
  store i8* %t1166, i8** %numWord.var, align 8
  store i8* %t1166, i8** @numWord, align 8
  %t1167 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.82, i64 0, i64 0
  %t1168 = load i8*, i8** %numWord.var, align 8
  %t1169 = call i64 @strlen(i8* %t1167)
  %t1170 = call i64 @strlen(i8* %t1168)
  %t1171 = add i64 %t1169, %t1170
  %t1172 = add i64 %t1171, 1
  %t1173 = call i8* @malloc(i64 %t1172)
  %t1174 = call i8* @strcpy(i8* %t1173, i8* %t1167)
  %t1175 = call i8* @strcat(i8* %t1173, i8* %t1168)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1173)
  %t1176 = call i8* @malloc(i64 16)
  %t1177 = bitcast i8* %t1176 to %struct.GADTValue*
  %t1178 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1177, i32 0, i32 0
  store i32 0, i32* %t1178, align 4
  %t1179 = call i8* @malloc(i64 8)
  %t1180 = fadd double 99.0, 0.0
  %t1181 = bitcast double %t1180 to i64
  %t1182 = inttoptr i64 %t1181 to i8*
  %t1183 = getelementptr inbounds i8, i8* %t1179, i64 0
  %t1184 = bitcast i8* %t1183 to i8**
  store i8* %t1182, i8** %t1184, align 8
  %t1185 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1177, i32 0, i32 1
  store i8* %t1179, i8** %t1185, align 8
  %t1187 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1177, i32 0, i32 0
  %t1186 = load i32, i32* %t1187, align 4
  switch i32 %t1186, label %match.default.87 [ i32 0, label %match.arm0.89 i32 1, label %match.arm1.90 ]
match.arm0.89:
  %t1188 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1177, i32 0, i32 1
  %t1189 = load i8*, i8** %t1188, align 8
  %t1190 = getelementptr inbounds i8, i8* %t1189, i64 0
  %t1191 = bitcast i8* %t1190 to i8**
  %t1192 = load i8*, i8** %t1191, align 8
  store i8* %t1192, i8** %t1193, align 8
  %t1194 = load i8*, i8** %t1193, align 8
  %t1197 = ptrtoint i8* %t1194 to i64
  %t1196 = bitcast i64 %t1197 to double
  br label %match.merge.88
match.arm1.90:
  %t1195 = fneg double 1.0
  br label %match.merge.88
match.default.87:
  br label %match.merge.88
match.merge.88:
  %t1199 = phi double [ %t1196, %match.arm0.89 ], [ %t1195, %match.arm1.90 ], [ 0.0, %match.default.87 ]
  store double %t1199, double* %unwrapped.var, align 8
  %t1200 = bitcast double %t1199 to i64
  %t1201 = inttoptr i64 %t1200 to i8*
  store i8* %t1201, i8** @unwrapped, align 8
  %t1202 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.83, i64 0, i64 0
  %t1203 = load double, double* %unwrapped.var, align 8
  %t1204 = call i8* @malloc(i64 64)
  %t1205 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1204, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1203)
  %t1206 = call i64 @strlen(i8* %t1202)
  %t1207 = call i64 @strlen(i8* %t1204)
  %t1208 = add i64 %t1206, %t1207
  %t1209 = add i64 %t1208, 1
  %t1210 = call i8* @malloc(i64 %t1209)
  %t1211 = call i8* @strcpy(i8* %t1210, i8* %t1202)
  %t1212 = call i8* @strcat(i8* %t1210, i8* %t1204)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1210)
  ; GADT Sum Type Definition: PointPair
  ;   Constructor [0]: Pair(px, py)
  %t1213 = call i8* @malloc(i64 16)
  %t1214 = bitcast i8* %t1213 to %struct.GADTValue*
  %t1215 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1214, i32 0, i32 0
  store i32 0, i32* %t1215, align 4
  %t1216 = call i8* @malloc(i64 16)
  %t1217 = fadd double 15.0, 0.0
  %t1218 = bitcast double %t1217 to i64
  %t1219 = inttoptr i64 %t1218 to i8*
  %t1220 = getelementptr inbounds i8, i8* %t1216, i64 0
  %t1221 = bitcast i8* %t1220 to i8**
  store i8* %t1219, i8** %t1221, align 8
  %t1222 = fadd double 25.0, 0.0
  %t1223 = bitcast double %t1222 to i64
  %t1224 = inttoptr i64 %t1223 to i8*
  %t1225 = getelementptr inbounds i8, i8* %t1216, i64 8
  %t1226 = bitcast i8* %t1225 to i8**
  store i8* %t1224, i8** %t1226, align 8
  %t1227 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1214, i32 0, i32 1
  store i8* %t1216, i8** %t1227, align 8
  store %struct.GADTValue* %t1214, %struct.GADTValue** %pp.var, align 8
  %t1228 = bitcast %struct.GADTValue* %t1214 to i8*
  store i8* %t1228, i8** @pp, align 8
  %t1229 = load %struct.GADTValue*, %struct.GADTValue** %pp.var, align 8
  %t1231 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1229, i32 0, i32 0
  %t1230 = load i32, i32* %t1231, align 4
  switch i32 %t1230, label %match.default.91 [ i32 0, label %match.arm0.93 ]
match.arm0.93:
  %t1232 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1229, i32 0, i32 1
  %t1233 = load i8*, i8** %t1232, align 8
  %t1234 = getelementptr inbounds i8, i8* %t1233, i64 0
  %t1235 = bitcast i8* %t1234 to i8**
  %t1236 = load i8*, i8** %t1235, align 8
  store i8* %t1236, i8** %t1237, align 8
  %t1238 = getelementptr inbounds i8, i8* %t1233, i64 8
  %t1239 = bitcast i8* %t1238 to i8**
  %t1240 = load i8*, i8** %t1239, align 8
  store i8* %t1240, i8** %t1241, align 8
  %t1242 = load i8*, i8** %t1237, align 8
  %t1243 = load i8*, i8** %t1241, align 8
  %t1246 = ptrtoint i8* %t1242 to i64
  %t1245 = bitcast i64 %t1246 to double
  %t1248 = ptrtoint i8* %t1243 to i64
  %t1247 = bitcast i64 %t1248 to double
  %t1244 = fadd double %t1245, %t1247
  br label %match.merge.92
match.default.91:
  br label %match.merge.92
match.merge.92:
  %t1250 = phi double [ %t1244, %match.arm0.93 ], [ 0.0, %match.default.91 ]
  store double %t1250, double* %ppSum.var, align 8
  %t1251 = bitcast double %t1250 to i64
  %t1252 = inttoptr i64 %t1251 to i8*
  store i8* %t1252, i8** @ppSum, align 8
  %t1253 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.84, i64 0, i64 0
  %t1254 = load double, double* %ppSum.var, align 8
  %t1255 = call i8* @malloc(i64 64)
  %t1256 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1255, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1254)
  %t1257 = call i64 @strlen(i8* %t1253)
  %t1258 = call i64 @strlen(i8* %t1255)
  %t1259 = add i64 %t1257, %t1258
  %t1260 = add i64 %t1259, 1
  %t1261 = call i8* @malloc(i64 %t1260)
  %t1262 = call i8* @strcpy(i8* %t1261, i8* %t1253)
  %t1263 = call i8* @strcat(i8* %t1261, i8* %t1255)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1261)
  ; GADT Sum Type Definition: Shape
  ;   Constructor [0]: Circle(radius)
  ;   Constructor [1]: Rect(width, height)
  %t1264 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.85, i64 0, i64 0
  %t1265 = call i8* @malloc(i64 16)
  %t1266 = bitcast i8* %t1265 to %struct.GADTValue*
  %t1267 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1266, i32 0, i32 0
  store i32 0, i32* %t1267, align 4
  %t1268 = call i8* @malloc(i64 8)
  %t1269 = fadd double 15.0, 0.0
  %t1270 = bitcast double %t1269 to i64
  %t1271 = inttoptr i64 %t1270 to i8*
  %t1272 = getelementptr inbounds i8, i8* %t1268, i64 0
  %t1273 = bitcast i8* %t1272 to i8**
  store i8* %t1271, i8** %t1273, align 8
  %t1274 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1266, i32 0, i32 1
  store i8* %t1268, i8** %t1274, align 8
  %t1275 = call i8* @classifyShape(%struct.GADTValue* %t1266)
  %t1276 = call i64 @strlen(i8* %t1264)
  %t1277 = call i64 @strlen(i8* %t1275)
  %t1278 = add i64 %t1276, %t1277
  %t1279 = add i64 %t1278, 1
  %t1280 = call i8* @malloc(i64 %t1279)
  %t1281 = call i8* @strcpy(i8* %t1280, i8* %t1264)
  %t1282 = call i8* @strcat(i8* %t1280, i8* %t1275)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1280)
  %t1283 = call i8* @malloc(i64 16)
  %t1284 = bitcast i8* %t1283 to %struct.Array*
  %t1285 = getelementptr inbounds %struct.Array, %struct.Array* %t1284, i32 0, i32 0
  store i64 2, i64* %t1285, align 8
  %t1286 = call i8* @malloc(i64 16)
  %t1287 = fadd double 3.0, 0.0
  %t1288 = bitcast double %t1287 to i64
  %t1289 = inttoptr i64 %t1288 to i8*
  %t1290 = getelementptr inbounds i8, i8* %t1286, i64 0
  %t1291 = bitcast i8* %t1290 to i8**
  store i8* %t1289, i8** %t1291, align 8
  %t1292 = fadd double 4.0, 0.0
  %t1293 = bitcast double %t1292 to i64
  %t1294 = inttoptr i64 %t1293 to i8*
  %t1295 = getelementptr inbounds i8, i8* %t1286, i64 8
  %t1296 = bitcast i8* %t1295 to i8**
  store i8* %t1294, i8** %t1296, align 8
  %t1297 = getelementptr inbounds %struct.Array, %struct.Array* %t1284, i32 0, i32 1
  %t1298 = bitcast i8* %t1286 to i8**
  store i8** %t1298, i8*** %t1297, align 8
  store %struct.Array* %t1284, %struct.Array** %coords.var, align 8
  %t1299 = bitcast %struct.Array* %t1284 to i8*
  store i8* %t1299, i8** @coords, align 8
  %t1300 = load %struct.Array*, %struct.Array** %coords.var, align 8
  %t1302 = bitcast %struct.Array* %t1300 to i8*
  %t1301 = bitcast i8* %t1302 to %struct.GADTValue*
  %t1304 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1301, i32 0, i32 0
  %t1303 = load i32, i32* %t1304, align 4
  switch i32 %t1303, label %match.default.94 [ i32 0, label %match.arm0.96 ]
match.arm0.96:
  %t1305 = fmul double 0.0, 0.0
  %t1306 = fmul double 0.0, 0.0
  %t1307 = fadd double %t1305, %t1306
  br label %match.merge.95
match.default.94:
  br label %match.merge.95
match.merge.95:
  %t1309 = phi double [ %t1307, %match.arm0.96 ], [ 0.0, %match.default.94 ]
  store double %t1309, double* %pythagoras.var, align 8
  %t1310 = bitcast double %t1309 to i64
  %t1311 = inttoptr i64 %t1310 to i8*
  store i8* %t1311, i8** @pythagoras, align 8
  %t1312 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.86, i64 0, i64 0
  %t1313 = load double, double* %pythagoras.var, align 8
  %t1314 = call i8* @malloc(i64 64)
  %t1315 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1314, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1313)
  %t1316 = call i64 @strlen(i8* %t1312)
  %t1317 = call i64 @strlen(i8* %t1314)
  %t1318 = add i64 %t1316, %t1317
  %t1319 = add i64 %t1318, 1
  %t1320 = call i8* @malloc(i64 %t1319)
  %t1321 = call i8* @strcpy(i8* %t1320, i8* %t1312)
  %t1322 = call i8* @strcat(i8* %t1320, i8* %t1314)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1320)
  %t1323 = call i8* @malloc(i64 40)
  %t1324 = bitcast i8* %t1323 to i64*
  store i64 2, i64* %t1324, align 8
  %t1325 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.87, i64 0, i64 0
  %t1326 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.88, i64 0, i64 0
  %t1327 = getelementptr inbounds i8, i8* %t1323, i64 8
  %t1328 = bitcast i8* %t1327 to i8**
  store i8* %t1325, i8** %t1328, align 8
  %t1329 = getelementptr inbounds i8, i8* %t1323, i64 16
  %t1330 = bitcast i8* %t1329 to i8**
  store i8* %t1326, i8** %t1330, align 8
  %t1331 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.89, i64 0, i64 0
  %t1332 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.90, i64 0, i64 0
  %t1333 = getelementptr inbounds i8, i8* %t1323, i64 24
  %t1334 = bitcast i8* %t1333 to i8**
  store i8* %t1331, i8** %t1334, align 8
  %t1335 = getelementptr inbounds i8, i8* %t1323, i64 32
  %t1336 = bitcast i8* %t1335 to i8**
  store i8* %t1332, i8** %t1336, align 8
  store i8* %t1323, i8** %userRec.var, align 8
  store i8* %t1323, i8** @userRec, align 8
  %t1337 = load i8*, i8** %userRec.var, align 8
  %t1338 = bitcast i8* %t1337 to %struct.GADTValue*
  %t1340 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1338, i32 0, i32 0
  %t1339 = load i32, i32* %t1340, align 4
  switch i32 %t1339, label %match.default.97 [ i32 0, label %match.arm0.99 ]
match.arm0.99:
  %t1341 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.87, i64 0, i64 0
  %t1342 = call i8* @_tl_record_get(i8* %t1337, i8* %t1341)
  store i8* %t1342, i8** %t1343, align 8
  %t1344 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.89, i64 0, i64 0
  %t1345 = call i8* @_tl_record_get(i8* %t1337, i8* %t1344)
  store i8* %t1345, i8** %t1346, align 8
  %t1347 = load i8*, i8** %t1343, align 8
  %t1348 = getelementptr inbounds [3 x i8], [3 x i8]* @.str.91, i64 0, i64 0
  %t1349 = load i8*, i8** %t1346, align 8
  %t1350 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.92, i64 0, i64 0
  %t1351 = call i64 @strlen(i8* %t1349)
  %t1352 = call i64 @strlen(i8* %t1350)
  %t1353 = add i64 %t1351, %t1352
  %t1354 = add i64 %t1353, 1
  %t1355 = call i8* @malloc(i64 %t1354)
  %t1356 = call i8* @strcpy(i8* %t1355, i8* %t1349)
  %t1357 = call i8* @strcat(i8* %t1355, i8* %t1350)
  %t1358 = call i64 @strlen(i8* %t1348)
  %t1359 = call i64 @strlen(i8* %t1355)
  %t1360 = add i64 %t1358, %t1359
  %t1361 = add i64 %t1360, 1
  %t1362 = call i8* @malloc(i64 %t1361)
  %t1363 = call i8* @strcpy(i8* %t1362, i8* %t1348)
  %t1364 = call i8* @strcat(i8* %t1362, i8* %t1355)
  %t1365 = call i64 @strlen(i8* %t1347)
  %t1366 = call i64 @strlen(i8* %t1362)
  %t1367 = add i64 %t1365, %t1366
  %t1368 = add i64 %t1367, 1
  %t1369 = call i8* @malloc(i64 %t1368)
  %t1370 = call i8* @strcpy(i8* %t1369, i8* %t1347)
  %t1371 = call i8* @strcat(i8* %t1369, i8* %t1362)
  br label %match.merge.98
match.default.97:
  br label %match.merge.98
match.merge.98:
  %t1372 = phi i8* [ %t1369, %match.arm0.99 ], [ null, %match.default.97 ]
  store i8* %t1372, i8** %userGreeting.var, align 8
  store i8* %t1372, i8** @userGreeting, align 8
  %t1373 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.93, i64 0, i64 0
  %t1374 = load i8*, i8** %userGreeting.var, align 8
  %t1375 = call i64 @strlen(i8* %t1373)
  %t1376 = call i64 @strlen(i8* %t1374)
  %t1377 = add i64 %t1375, %t1376
  %t1378 = add i64 %t1377, 1
  %t1379 = call i8* @malloc(i64 %t1378)
  %t1380 = call i8* @strcpy(i8* %t1379, i8* %t1373)
  %t1381 = call i8* @strcat(i8* %t1379, i8* %t1374)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1379)
  ; GADT Sum Type Definition: TaskState
  ;   Constructor [0]: Pending()
  ;   Constructor [1]: Finished()
  ;   Constructor [2]: Cancelled()
  %t1382 = call i8* @malloc(i64 16)
  %t1383 = bitcast i8* %t1382 to %struct.GADTValue*
  %t1384 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1383, i32 0, i32 0
  store i32 1, i32* %t1384, align 4
  %t1385 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1383, i32 0, i32 1
  store i8* null, i8** %t1385, align 8
  store %struct.GADTValue* %t1383, %struct.GADTValue** %taskSt.var, align 8
  %t1386 = bitcast %struct.GADTValue* %t1383 to i8*
  store i8* %t1386, i8** @taskSt, align 8
  %t1387 = load %struct.GADTValue*, %struct.GADTValue** %taskSt.var, align 8
  %t1389 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t1387, i32 0, i32 0
  %t1388 = load i32, i32* %t1389, align 4
  switch i32 %t1388, label %match.default.100 [ i32 1, label %match.arm0.102 ]
match.arm0.102:
  %t1390 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.94, i64 0, i64 0
  br label %match.merge.101
match.arm1.103:
  %t1391 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.95, i64 0, i64 0
  br label %match.merge.101
match.default.100:
  br label %match.merge.101
match.merge.101:
  %t1392 = phi i8* [ %t1390, %match.arm0.102 ], [ %t1391, %match.arm1.103 ], [ null, %match.default.100 ]
  store i8* %t1392, i8** %taskDone.var, align 8
  store i8* %t1392, i8** @taskDone, align 8
  %t1393 = getelementptr inbounds [19 x i8], [19 x i8]* @.str.96, i64 0, i64 0
  %t1394 = load i8*, i8** %taskDone.var, align 8
  %t1395 = call i64 @strlen(i8* %t1393)
  %t1396 = call i64 @strlen(i8* %t1394)
  %t1397 = add i64 %t1395, %t1396
  %t1398 = add i64 %t1397, 1
  %t1399 = call i8* @malloc(i64 %t1398)
  %t1400 = call i8* @strcpy(i8* %t1399, i8* %t1393)
  %t1401 = call i8* @strcat(i8* %t1399, i8* %t1394)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1399)
  %t1402 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.97, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1402)
  %t1403 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.98, i64 0, i64 0
  %t1404 = call double @MathCore_square(double 7.0)
  %t1405 = call i8* @malloc(i64 64)
  %t1406 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1405, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1404)
  %t1407 = call i64 @strlen(i8* %t1403)
  %t1408 = call i64 @strlen(i8* %t1405)
  %t1409 = add i64 %t1407, %t1408
  %t1410 = add i64 %t1409, 1
  %t1411 = call i8* @malloc(i64 %t1410)
  %t1412 = call i8* @strcpy(i8* %t1411, i8* %t1403)
  %t1413 = call i8* @strcat(i8* %t1411, i8* %t1405)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1411)
  %t1414 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.99, i64 0, i64 0
  %t1415 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.100, i64 0, i64 0
  %t1416 = call i8* @MathCore_Nested_greet(i8* %t1415)
  %t1417 = call i64 @strlen(i8* %t1414)
  %t1418 = call i64 @strlen(i8* %t1416)
  %t1419 = add i64 %t1417, %t1418
  %t1420 = add i64 %t1419, 1
  %t1421 = call i8* @malloc(i64 %t1420)
  %t1422 = call i8* @strcpy(i8* %t1421, i8* %t1414)
  %t1423 = call i8* @strcat(i8* %t1421, i8* %t1416)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1421)
  %t1424 = getelementptr inbounds [33 x i8], [33 x i8]* @.str.101, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1424)
  %t1425 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.102, i64 0, i64 0
  %t1426 = call double @computeWithWhere(double 15.0)
  %t1427 = call i8* @malloc(i64 64)
  %t1428 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1427, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1426)
  %t1429 = call i64 @strlen(i8* %t1425)
  %t1430 = call i64 @strlen(i8* %t1427)
  %t1431 = add i64 %t1429, %t1430
  %t1432 = add i64 %t1431, 1
  %t1433 = call i8* @malloc(i64 %t1432)
  %t1434 = call i8* @strcpy(i8* %t1433, i8* %t1425)
  %t1435 = call i8* @strcat(i8* %t1433, i8* %t1427)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1433)
  %t1436 = getelementptr inbounds [33 x i8], [33 x i8]* @.str.103, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1436)
  %t1437 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.104, i64 0, i64 0
  %t1438 = call double @llvm.sqrt.f64(double 49.0)
  %t1439 = call i8* @malloc(i64 64)
  %t1440 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1439, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1438)
  %t1441 = call i64 @strlen(i8* %t1437)
  %t1442 = call i64 @strlen(i8* %t1439)
  %t1443 = add i64 %t1441, %t1442
  %t1444 = add i64 %t1443, 1
  %t1445 = call i8* @malloc(i64 %t1444)
  %t1446 = call i8* @strcpy(i8* %t1445, i8* %t1437)
  %t1447 = call i8* @strcat(i8* %t1445, i8* %t1439)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1445)
  %t1448 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.105, i64 0, i64 0
  %t1449 = call double @llvm.floor.f64(double 9.85)
  %t1450 = call i8* @malloc(i64 64)
  %t1451 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1450, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1449)
  %t1452 = call i64 @strlen(i8* %t1448)
  %t1453 = call i64 @strlen(i8* %t1450)
  %t1454 = add i64 %t1452, %t1453
  %t1455 = add i64 %t1454, 1
  %t1456 = call i8* @malloc(i64 %t1455)
  %t1457 = call i8* @strcpy(i8* %t1456, i8* %t1448)
  %t1458 = call i8* @strcat(i8* %t1456, i8* %t1450)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1456)
  %t1459 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.106, i64 0, i64 0
  %t1460 = fneg double 12.5
  %t1461 = call double @llvm.fabs.f64(double %t1460)
  %t1462 = call i8* @malloc(i64 64)
  %t1463 = call i32 (i8*, i8*, ...) @sprintf(i8* %t1462, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t1461)
  %t1464 = call i64 @strlen(i8* %t1459)
  %t1465 = call i64 @strlen(i8* %t1462)
  %t1466 = add i64 %t1464, %t1465
  %t1467 = add i64 %t1466, 1
  %t1468 = call i8* @malloc(i64 %t1467)
  %t1469 = call i8* @strcpy(i8* %t1468, i8* %t1459)
  %t1470 = call i8* @strcat(i8* %t1468, i8* %t1462)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1468)
  %t1471 = getelementptr inbounds [38 x i8], [38 x i8]* @.str.107, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t1471)
  ret i32 0
}