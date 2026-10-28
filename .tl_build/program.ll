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
@.str.0 = private unnamed_addr constant [57 x i8] c"=== TYPELANG COMPREHENSIVE COMPILER VALIDATION SUITE ===\00", align 1
@.str.1 = private unnamed_addr constant [34 x i8] c"[TEST 1: PRIMITIVES & ARITHMETIC]\00", align 1
@.str.2 = private unnamed_addr constant [6 x i8] c"int: \00", align 1
@.str.3 = private unnamed_addr constant [8 x i8] c"float: \00", align 1
@.str.4 = private unnamed_addr constant [6 x i8] c"neg: \00", align 1
@.str.5 = private unnamed_addr constant [12 x i8] c"arith_add: \00", align 1
@.str.6 = private unnamed_addr constant [12 x i8] c"arith_sub: \00", align 1
@.str.7 = private unnamed_addr constant [12 x i8] c"arith_mul: \00", align 1
@.str.8 = private unnamed_addr constant [12 x i8] c"arith_div: \00", align 1
@.str.9 = private unnamed_addr constant [12 x i8] c"arith_mod: \00", align 1
@.str.10 = private unnamed_addr constant [13 x i8] c"precedence: \00", align 1
@.str.11 = private unnamed_addr constant [27 x i8] c"[TEST 2: BOOLEANS & LOGIC]\00", align 1
@.str.12 = private unnamed_addr constant [11 x i8] c"true_val: \00", align 1
@.str.13 = private unnamed_addr constant [12 x i8] c"false_val: \00", align 1
@.str.14 = private unnamed_addr constant [9 x i8] c"op_and: \00", align 1
@.str.15 = private unnamed_addr constant [8 x i8] c"op_or: \00", align 1
@.str.16 = private unnamed_addr constant [9 x i8] c"op_not: \00", align 1
@.str.17 = private unnamed_addr constant [9 x i8] c"cmp_eq: \00", align 1
@.str.18 = private unnamed_addr constant [9 x i8] c"cmp_ne: \00", align 1
@.str.19 = private unnamed_addr constant [9 x i8] c"cmp_lt: \00", align 1
@.str.20 = private unnamed_addr constant [9 x i8] c"cmp_le: \00", align 1
@.str.21 = private unnamed_addr constant [9 x i8] c"cmp_gt: \00", align 1
@.str.22 = private unnamed_addr constant [9 x i8] c"cmp_ge: \00", align 1
@.str.23 = private unnamed_addr constant [34 x i8] c"[TEST 3: STRINGS & CONCATENATION]\00", align 1
@.str.24 = private unnamed_addr constant [6 x i8] c"Hello\00", align 1
@.str.25 = private unnamed_addr constant [9 x i8] c"TypeLang\00", align 1
@.str.26 = private unnamed_addr constant [3 x i8] c", \00", align 1
@.str.27 = private unnamed_addr constant [2 x i8] c"!\00", align 1
@.str.28 = private unnamed_addr constant [11 x i8] c"greeting: \00", align 1
@.str.29 = private unnamed_addr constant [33 x i8] c"[TEST 4: VARIABLES & MUTABILITY]\00", align 1
@.str.30 = private unnamed_addr constant [10 x i8] c"mut_acc: \00", align 1
@.str.31 = private unnamed_addr constant [15 x i8] c"block_result: \00", align 1
@.str.32 = private unnamed_addr constant [32 x i8] c"[TEST 5: FUNCTIONS & RECURSION]\00", align 1
@.str.33 = private unnamed_addr constant [17 x i8] c"addTwo(18, 24): \00", align 1
@.str.34 = private unnamed_addr constant [15 x i8] c"factorial(6): \00", align 1
@.str.35 = private unnamed_addr constant [15 x i8] c"fibonacci(8): \00", align 1
@.str.36 = private unnamed_addr constant [13 x i8] c"isEven(10): \00", align 1
@.str.37 = private unnamed_addr constant [12 x i8] c"isOdd(10): \00", align 1
@.str.38 = private unnamed_addr constant [32 x i8] c"[TEST 6: FIRST-CLASS FUNCTIONS]\00", align 1
@.str.39 = private unnamed_addr constant [19 x i8] c"lambda_square(9): \00", align 1
@.str.40 = private unnamed_addr constant [21 x i8] c"apply_higher_order: \00", align 1
@.str.41 = private unnamed_addr constant [23 x i8] c"[TEST 7: CONTROL FLOW]\00", align 1
@.str.42 = private unnamed_addr constant [9 x i8] c"above_40\00", align 1
@.str.43 = private unnamed_addr constant [15 x i8] c"below_or_equal\00", align 1
@.str.44 = private unnamed_addr constant [10 x i8] c"ternary: \00", align 1
@.str.45 = private unnamed_addr constant [12 x i8] c"while_sum: \00", align 1
@.str.46 = private unnamed_addr constant [21 x i8] c"break_continue_sum: \00", align 1
@.str.47 = private unnamed_addr constant [6 x i8] c"First\00", align 1
@.str.48 = private unnamed_addr constant [7 x i8] c"Second\00", align 1
@.str.49 = private unnamed_addr constant [6 x i8] c"Third\00", align 1
@.str.50 = private unnamed_addr constant [6 x i8] c"Other\00", align 1
@.str.51 = private unnamed_addr constant [16 x i8] c"switch_result: \00", align 1
@.str.52 = private unnamed_addr constant [31 x i8] c"[TEST 8: MODULES & NAMESPACES]\00", align 1
@.str.53 = private unnamed_addr constant [17 x i8] c"module_cube(4): \00", align 1
@.str.54 = private unnamed_addr constant [20 x i8] c"nested_area(5, 7): \00", align 1
@.str.55 = private unnamed_addr constant [24 x i8] c"[TEST 9: WHERE CLAUSES]\00", align 1
@.str.56 = private unnamed_addr constant [19 x i8] c"where_result(25): \00", align 1
@.str.57 = private unnamed_addr constant [24 x i8] c"[TEST 10: MATH LIBRARY]\00", align 1
@.str.58 = private unnamed_addr constant [11 x i8] c"sqrt(64): \00", align 1
@.str.59 = private unnamed_addr constant [14 x i8] c"floor(9.87): \00", align 1
@.str.60 = private unnamed_addr constant [13 x i8] c"abs(-42.5): \00", align 1
@.str.61 = private unnamed_addr constant [35 x i8] c"[TEST 11: ADTS & PATTERN MATCHING]\00", align 1
@.str.62 = private unnamed_addr constant [12 x i8] c"color_red: \00", align 1
@.str.63 = private unnamed_addr constant [14 x i8] c"color_green: \00", align 1
@.str.64 = private unnamed_addr constant [13 x i8] c"color_blue: \00", align 1
@.str.65 = private unnamed_addr constant [13 x i8] c"maybe_some: \00", align 1
@.str.66 = private unnamed_addr constant [13 x i8] c"maybe_none: \00", align 1
@.str.67 = private unnamed_addr constant [52 x i8] c"=== ALL VALIDATION TESTS COMPLETED SUCCESSFULLY ===\00", align 1

; --- Global and Module Variables ---
@intVal = global i8* null, align 8
@floatVal = global i8* null, align 8
@negVal = global i8* null, align 8
@arithAdd = global i8* null, align 8
@arithSub = global i8* null, align 8
@arithMul = global i8* null, align 8
@arithDiv = global i8* null, align 8
@arithMod = global i8* null, align 8
@precedence = global i8* null, align 8
@boolTrue = global i8* null, align 8
@boolFalse = global i8* null, align 8
@hello = global i8* null, align 8
@world = global i8* null, align 8
@joined = global i8* null, align 8
@acc = global i8* null, align 8
@blockResult = global i8* null, align 8
@squareLambda = global i8* null, align 8
@ternaryVal = global i8* null, align 8
@loopSum = global i8* null, align 8
@counter = global i8* null, align 8
@breakSum = global i8* null, align 8
@bIndex = global i8* null, align 8
@switchResult = global i8* null, align 8

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

define internal i8* @.lambda_1(i8* %arg.n) {
entry:
  %t520 = alloca double, align 8
  %t521 = ptrtoint i8* %arg.n to i64
  %t522 = bitcast i64 %t521 to double
  store double %t522, double* %t520, align 8
  %t523 = load double, double* %t520, align 8
  %t524 = load double, double* %t520, align 8
  %t525 = fmul double %t523, %t524
  %t526 = bitcast double %t525 to i64
  %t527 = inttoptr i64 %t526 to i8*
  ret i8* %t527
}

define double @addTwo(double %arg.x, double %arg.y) {
entry:
  %x.addr = alloca double, align 8
  %y.addr = alloca double, align 8
  store double %arg.x, double* %x.addr, align 8
  store double %arg.y, double* %y.addr, align 8
  %t1 = load double, double* %x.addr, align 8
  %t2 = load double, double* %y.addr, align 8
  %t3 = fadd double %t1, %t2
  ret double %t3
}

define double @factorial(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t4 = load double, double* %n.addr, align 8
  %t5 = fcmp ole double %t4, 1.0
  br i1 %t5, label %then.1, label %else.2
then.1:
  br label %if.merge.3
else.2:
  %t6 = load double, double* %n.addr, align 8
  %t7 = load double, double* %n.addr, align 8
  %t8 = fsub double %t7, 1.0
  %t9 = call double @factorial(double %t8)
  %t10 = fmul double %t6, %t9
  br label %if.merge.3
if.merge.3:
  %t11 = phi double [ 1.0, %then.1 ], [ %t10, %else.2 ]
  ret double %t11
}

define double @fibonacci(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t12 = load double, double* %n.addr, align 8
  %t13 = fcmp ole double %t12, 0.0
  br i1 %t13, label %then.4, label %else.5
then.4:
  br label %if.merge.6
else.5:
  %t14 = load double, double* %n.addr, align 8
  %t15 = fcmp oeq double %t14, 1.0
  br i1 %t15, label %then.7, label %else.8
then.7:
  br label %if.merge.9
else.8:
  %t16 = load double, double* %n.addr, align 8
  %t17 = fsub double %t16, 1.0
  %t18 = call double @fibonacci(double %t17)
  %t19 = load double, double* %n.addr, align 8
  %t20 = fsub double %t19, 2.0
  %t21 = call double @fibonacci(double %t20)
  %t22 = fadd double %t18, %t21
  br label %if.merge.9
if.merge.9:
  %t23 = phi double [ 1.0, %then.7 ], [ %t22, %else.8 ]
  br label %if.merge.6
if.merge.6:
  %t24 = phi double [ 0.0, %then.4 ], [ %t23, %if.merge.9 ]
  ret double %t24
}

define i1 @isEven(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t25 = load double, double* %n.addr, align 8
  %t26 = fcmp oeq double %t25, 0.0
  br i1 %t26, label %then.10, label %else.11
then.10:
  br label %if.merge.12
else.11:
  %t27 = load double, double* %n.addr, align 8
  %t28 = fsub double %t27, 1.0
  %t29 = call i1 @isOdd(double %t28)
  br label %if.merge.12
if.merge.12:
  %t30 = phi i1 [ 1, %then.10 ], [ %t29, %else.11 ]
  ret i1 %t30
}

define i1 @isOdd(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t31 = load double, double* %n.addr, align 8
  %t32 = fcmp oeq double %t31, 0.0
  br i1 %t32, label %then.13, label %else.14
then.13:
  br label %if.merge.15
else.14:
  %t33 = load double, double* %n.addr, align 8
  %t34 = fsub double %t33, 1.0
  %t35 = call i1 @isEven(double %t34)
  br label %if.merge.15
if.merge.15:
  %t36 = phi i1 [ 0, %then.13 ], [ %t35, %else.14 ]
  ret i1 %t36
}

define double @applyHigherOrder(i8* %arg.f, double %arg.val) {
entry:
  %f.addr = alloca i8*, align 8
  %val.addr = alloca double, align 8
  store i8* %arg.f, i8** %f.addr, align 8
  store double %arg.val, double* %val.addr, align 8
  %t37 = load i8*, i8** %f.addr, align 8
  %t38 = load double, double* %val.addr, align 8
  %t39 = bitcast i8* %t37 to i8* (i8*)*
  %t40 = bitcast double %t38 to i64
  %t41 = inttoptr i64 %t40 to i8*
  %t42 = call i8* %t39(i8* %t41)
  %t43 = ptrtoint i8* %t42 to i64
  %t44 = bitcast i64 %t43 to double
  ret double %t44
}

define double @MathHelper_cube(double %arg.x) {
entry:
  %x.addr = alloca double, align 8
  store double %arg.x, double* %x.addr, align 8
  %t45 = load double, double* %x.addr, align 8
  %t46 = load double, double* %x.addr, align 8
  %t47 = fmul double %t45, %t46
  %t48 = load double, double* %x.addr, align 8
  %t49 = fmul double %t47, %t48
  ret double %t49
}

define double @MathHelper_NestedGeometry_area(double %arg.w, double %arg.h) {
entry:
  %w.addr = alloca double, align 8
  %h.addr = alloca double, align 8
  store double %arg.w, double* %w.addr, align 8
  store double %arg.h, double* %h.addr, align 8
  %t50 = load double, double* %w.addr, align 8
  %t51 = load double, double* %h.addr, align 8
  %t52 = fmul double %t50, %t51
  ret double %t52
}

define double @computeWhere(double %arg.x) {
entry:
  %x.addr = alloca double, align 8
  %offset.var = alloca double, align 8
  store double %arg.x, double* %x.addr, align 8
  store double 100.0, double* %offset.var, align 8
  %t53 = load double, double* %x.addr, align 8
  %t54 = call double @doubleVal(double %t53)
  %t55 = load double, double* %offset.var, align 8
  %t56 = fadd double %t54, %t55
  ret double %t56
}

define double @doubleVal(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t57 = load double, double* %n.addr, align 8
  %t58 = fmul double %t57, 2.0
  ret double %t58
}

define double @colorToCode(%struct.GADTValue* %arg.c) {
entry:
  %c.addr = alloca %struct.GADTValue*, align 8
  store %struct.GADTValue* %arg.c, %struct.GADTValue** %c.addr, align 8
  %t59 = load %struct.GADTValue*, %struct.GADTValue** %c.addr, align 8
  %t61 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t59, i32 0, i32 0
  %t60 = load i32, i32* %t61, align 4
  switch i32 %t60, label %match.default.16 [ i32 0, label %match.arm0.18 i32 1, label %match.arm1.19 i32 2, label %match.arm2.20 ]
match.arm0.18:
  br label %match.merge.17
match.arm1.19:
  br label %match.merge.17
match.arm2.20:
  br label %match.merge.17
match.default.16:
  br label %match.merge.17
match.merge.17:
  %t63 = phi double [ 1.0, %match.arm0.18 ], [ 2.0, %match.arm1.19 ], [ 3.0, %match.arm2.20 ], [ 0.0, %match.default.16 ]
  ret double %t63
}

define double @getWithDefault(%struct.GADTValue* %arg.m, double %arg.defVal) {
entry:
  %m.addr = alloca %struct.GADTValue*, align 8
  %defVal.addr = alloca double, align 8
  %t72 = alloca i8*, align 8
  store %struct.GADTValue* %arg.m, %struct.GADTValue** %m.addr, align 8
  store double %arg.defVal, double* %defVal.addr, align 8
  %t64 = load %struct.GADTValue*, %struct.GADTValue** %m.addr, align 8
  %t66 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t64, i32 0, i32 0
  %t65 = load i32, i32* %t66, align 4
  switch i32 %t65, label %match.default.21 [ i32 0, label %match.arm0.23 i32 1, label %match.arm1.24 ]
match.arm0.23:
  %t67 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t64, i32 0, i32 1
  %t68 = load i8*, i8** %t67, align 8
  %t69 = getelementptr inbounds i8, i8* %t68, i64 0
  %t70 = bitcast i8* %t69 to i8**
  %t71 = load i8*, i8** %t70, align 8
  store i8* %t71, i8** %t72, align 8
  %t73 = load i8*, i8** %t72, align 8
  %t76 = ptrtoint i8* %t73 to i64
  %t75 = bitcast i64 %t76 to double
  br label %match.merge.22
match.arm1.24:
  %t74 = load double, double* %defVal.addr, align 8
  br label %match.merge.22
match.default.21:
  br label %match.merge.22
match.merge.22:
  %t78 = phi double [ %t75, %match.arm0.23 ], [ %t74, %match.arm1.24 ], [ 0.0, %match.default.21 ]
  ret double %t78
}

define i32 @main() {
entry:
  %intVal.var = alloca double, align 8
  %floatVal.var = alloca double, align 8
  %negVal.var = alloca double, align 8
  %arithAdd.var = alloca double, align 8
  %arithSub.var = alloca double, align 8
  %arithMul.var = alloca double, align 8
  %arithDiv.var = alloca double, align 8
  %arithMod.var = alloca double, align 8
  %precedence.var = alloca double, align 8
  %boolTrue.var = alloca i1, align 8
  %boolFalse.var = alloca i1, align 8
  %hello.var = alloca i8*, align 8
  %world.var = alloca i8*, align 8
  %joined.var = alloca i8*, align 8
  %acc.var = alloca double, align 8
  %inner1.var = alloca double, align 8
  %inner2.var = alloca double, align 8
  %blockResult.var = alloca double, align 8
  %squareLambda.var = alloca i8*, align 8
  %ternaryVal.var = alloca i8*, align 8
  %loopSum.var = alloca double, align 8
  %counter.var = alloca double, align 8
  %breakSum.var = alloca double, align 8
  %bIndex.var = alloca double, align 8
  %switchResult.var = alloca i8*, align 8
  %t79 = getelementptr inbounds [57 x i8], [57 x i8]* @.str.0, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t79)
  %t80 = getelementptr inbounds [34 x i8], [34 x i8]* @.str.1, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t80)
  store double 42.0, double* %intVal.var, align 8
  %t81 = fadd double 42.0, 0.0
  %t82 = bitcast double %t81 to i64
  %t83 = inttoptr i64 %t82 to i8*
  store i8* %t83, i8** @intVal, align 8
  store double 3.14159, double* %floatVal.var, align 8
  %t84 = fadd double 3.14159, 0.0
  %t85 = bitcast double %t84 to i64
  %t86 = inttoptr i64 %t85 to i8*
  store i8* %t86, i8** @floatVal, align 8
  %t87 = fneg double 15.0
  store double %t87, double* %negVal.var, align 8
  %t88 = bitcast double %t87 to i64
  %t89 = inttoptr i64 %t88 to i8*
  store i8* %t89, i8** @negVal, align 8
  %t90 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.2, i64 0, i64 0
  %t91 = load double, double* %intVal.var, align 8
  %t92 = call i8* @malloc(i64 64)
  %t93 = call i32 (i8*, i8*, ...) @sprintf(i8* %t92, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t91)
  %t94 = call i64 @strlen(i8* %t90)
  %t95 = call i64 @strlen(i8* %t92)
  %t96 = add i64 %t94, %t95
  %t97 = add i64 %t96, 1
  %t98 = call i8* @malloc(i64 %t97)
  %t99 = call i8* @strcpy(i8* %t98, i8* %t90)
  %t100 = call i8* @strcat(i8* %t98, i8* %t92)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t98)
  %t101 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.3, i64 0, i64 0
  %t102 = load double, double* %floatVal.var, align 8
  %t103 = call i8* @malloc(i64 64)
  %t104 = call i32 (i8*, i8*, ...) @sprintf(i8* %t103, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t102)
  %t105 = call i64 @strlen(i8* %t101)
  %t106 = call i64 @strlen(i8* %t103)
  %t107 = add i64 %t105, %t106
  %t108 = add i64 %t107, 1
  %t109 = call i8* @malloc(i64 %t108)
  %t110 = call i8* @strcpy(i8* %t109, i8* %t101)
  %t111 = call i8* @strcat(i8* %t109, i8* %t103)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t109)
  %t112 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.4, i64 0, i64 0
  %t113 = load double, double* %negVal.var, align 8
  %t114 = call i8* @malloc(i64 64)
  %t115 = call i32 (i8*, i8*, ...) @sprintf(i8* %t114, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t113)
  %t116 = call i64 @strlen(i8* %t112)
  %t117 = call i64 @strlen(i8* %t114)
  %t118 = add i64 %t116, %t117
  %t119 = add i64 %t118, 1
  %t120 = call i8* @malloc(i64 %t119)
  %t121 = call i8* @strcpy(i8* %t120, i8* %t112)
  %t122 = call i8* @strcat(i8* %t120, i8* %t114)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t120)
  %t123 = load double, double* %intVal.var, align 8
  %t124 = fadd double %t123, 8.0
  store double %t124, double* %arithAdd.var, align 8
  %t125 = bitcast double %t124 to i64
  %t126 = inttoptr i64 %t125 to i8*
  store i8* %t126, i8** @arithAdd, align 8
  %t127 = load double, double* %intVal.var, align 8
  %t128 = fsub double %t127, 12.0
  store double %t128, double* %arithSub.var, align 8
  %t129 = bitcast double %t128 to i64
  %t130 = inttoptr i64 %t129 to i8*
  store i8* %t130, i8** @arithSub, align 8
  %t131 = load double, double* %intVal.var, align 8
  %t132 = fmul double %t131, 2.0
  store double %t132, double* %arithMul.var, align 8
  %t133 = bitcast double %t132 to i64
  %t134 = inttoptr i64 %t133 to i8*
  store i8* %t134, i8** @arithMul, align 8
  %t135 = fdiv double 84.0, 2.0
  store double %t135, double* %arithDiv.var, align 8
  %t136 = bitcast double %t135 to i64
  %t137 = inttoptr i64 %t136 to i8*
  store i8* %t137, i8** @arithDiv, align 8
  %t138 = frem double 17.0, 5.0
  store double %t138, double* %arithMod.var, align 8
  %t139 = bitcast double %t138 to i64
  %t140 = inttoptr i64 %t139 to i8*
  store i8* %t140, i8** @arithMod, align 8
  %t141 = fadd double 2.0, 3.0
  %t142 = fmul double %t141, 4.0
  %t143 = fdiv double 10.0, 2.0
  %t144 = fsub double %t142, %t143
  store double %t144, double* %precedence.var, align 8
  %t145 = bitcast double %t144 to i64
  %t146 = inttoptr i64 %t145 to i8*
  store i8* %t146, i8** @precedence, align 8
  %t147 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.5, i64 0, i64 0
  %t148 = load double, double* %arithAdd.var, align 8
  %t149 = call i8* @malloc(i64 64)
  %t150 = call i32 (i8*, i8*, ...) @sprintf(i8* %t149, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t148)
  %t151 = call i64 @strlen(i8* %t147)
  %t152 = call i64 @strlen(i8* %t149)
  %t153 = add i64 %t151, %t152
  %t154 = add i64 %t153, 1
  %t155 = call i8* @malloc(i64 %t154)
  %t156 = call i8* @strcpy(i8* %t155, i8* %t147)
  %t157 = call i8* @strcat(i8* %t155, i8* %t149)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t155)
  %t158 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.6, i64 0, i64 0
  %t159 = load double, double* %arithSub.var, align 8
  %t160 = call i8* @malloc(i64 64)
  %t161 = call i32 (i8*, i8*, ...) @sprintf(i8* %t160, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t159)
  %t162 = call i64 @strlen(i8* %t158)
  %t163 = call i64 @strlen(i8* %t160)
  %t164 = add i64 %t162, %t163
  %t165 = add i64 %t164, 1
  %t166 = call i8* @malloc(i64 %t165)
  %t167 = call i8* @strcpy(i8* %t166, i8* %t158)
  %t168 = call i8* @strcat(i8* %t166, i8* %t160)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t166)
  %t169 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.7, i64 0, i64 0
  %t170 = load double, double* %arithMul.var, align 8
  %t171 = call i8* @malloc(i64 64)
  %t172 = call i32 (i8*, i8*, ...) @sprintf(i8* %t171, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t170)
  %t173 = call i64 @strlen(i8* %t169)
  %t174 = call i64 @strlen(i8* %t171)
  %t175 = add i64 %t173, %t174
  %t176 = add i64 %t175, 1
  %t177 = call i8* @malloc(i64 %t176)
  %t178 = call i8* @strcpy(i8* %t177, i8* %t169)
  %t179 = call i8* @strcat(i8* %t177, i8* %t171)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t177)
  %t180 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.8, i64 0, i64 0
  %t181 = load double, double* %arithDiv.var, align 8
  %t182 = call i8* @malloc(i64 64)
  %t183 = call i32 (i8*, i8*, ...) @sprintf(i8* %t182, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t181)
  %t184 = call i64 @strlen(i8* %t180)
  %t185 = call i64 @strlen(i8* %t182)
  %t186 = add i64 %t184, %t185
  %t187 = add i64 %t186, 1
  %t188 = call i8* @malloc(i64 %t187)
  %t189 = call i8* @strcpy(i8* %t188, i8* %t180)
  %t190 = call i8* @strcat(i8* %t188, i8* %t182)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t188)
  %t191 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.9, i64 0, i64 0
  %t192 = load double, double* %arithMod.var, align 8
  %t193 = call i8* @malloc(i64 64)
  %t194 = call i32 (i8*, i8*, ...) @sprintf(i8* %t193, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t192)
  %t195 = call i64 @strlen(i8* %t191)
  %t196 = call i64 @strlen(i8* %t193)
  %t197 = add i64 %t195, %t196
  %t198 = add i64 %t197, 1
  %t199 = call i8* @malloc(i64 %t198)
  %t200 = call i8* @strcpy(i8* %t199, i8* %t191)
  %t201 = call i8* @strcat(i8* %t199, i8* %t193)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t199)
  %t202 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.10, i64 0, i64 0
  %t203 = load double, double* %precedence.var, align 8
  %t204 = call i8* @malloc(i64 64)
  %t205 = call i32 (i8*, i8*, ...) @sprintf(i8* %t204, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t203)
  %t206 = call i64 @strlen(i8* %t202)
  %t207 = call i64 @strlen(i8* %t204)
  %t208 = add i64 %t206, %t207
  %t209 = add i64 %t208, 1
  %t210 = call i8* @malloc(i64 %t209)
  %t211 = call i8* @strcpy(i8* %t210, i8* %t202)
  %t212 = call i8* @strcat(i8* %t210, i8* %t204)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t210)
  %t213 = getelementptr inbounds [27 x i8], [27 x i8]* @.str.11, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t213)
  store i1 1, i1* %boolTrue.var, align 8
  %t214 = zext i1 1 to i64
  %t215 = inttoptr i64 %t214 to i8*
  store i8* %t215, i8** @boolTrue, align 8
  store i1 0, i1* %boolFalse.var, align 8
  %t216 = zext i1 0 to i64
  %t217 = inttoptr i64 %t216 to i8*
  store i8* %t217, i8** @boolFalse, align 8
  %t218 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.12, i64 0, i64 0
  %t219 = load i1, i1* %boolTrue.var, align 8
  %t220 = call i8* @malloc(i64 64)
  %t221 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t222 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t223 = select i1 %t219, i8* %t221, i8* %t222
  %t224 = call i8* @strcpy(i8* %t220, i8* %t223)
  %t225 = call i64 @strlen(i8* %t218)
  %t226 = call i64 @strlen(i8* %t220)
  %t227 = add i64 %t225, %t226
  %t228 = add i64 %t227, 1
  %t229 = call i8* @malloc(i64 %t228)
  %t230 = call i8* @strcpy(i8* %t229, i8* %t218)
  %t231 = call i8* @strcat(i8* %t229, i8* %t220)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t229)
  %t232 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.13, i64 0, i64 0
  %t233 = load i1, i1* %boolFalse.var, align 8
  %t234 = call i8* @malloc(i64 64)
  %t235 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t236 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t237 = select i1 %t233, i8* %t235, i8* %t236
  %t238 = call i8* @strcpy(i8* %t234, i8* %t237)
  %t239 = call i64 @strlen(i8* %t232)
  %t240 = call i64 @strlen(i8* %t234)
  %t241 = add i64 %t239, %t240
  %t242 = add i64 %t241, 1
  %t243 = call i8* @malloc(i64 %t242)
  %t244 = call i8* @strcpy(i8* %t243, i8* %t232)
  %t245 = call i8* @strcat(i8* %t243, i8* %t234)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t243)
  %t246 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.14, i64 0, i64 0
  %t247 = load i1, i1* %boolTrue.var, align 8
  %t248 = load i1, i1* %boolFalse.var, align 8
  %t249 = and i1 %t247, %t248
  %t250 = call i8* @malloc(i64 64)
  %t251 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t252 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t253 = select i1 %t249, i8* %t251, i8* %t252
  %t254 = call i8* @strcpy(i8* %t250, i8* %t253)
  %t255 = call i64 @strlen(i8* %t246)
  %t256 = call i64 @strlen(i8* %t250)
  %t257 = add i64 %t255, %t256
  %t258 = add i64 %t257, 1
  %t259 = call i8* @malloc(i64 %t258)
  %t260 = call i8* @strcpy(i8* %t259, i8* %t246)
  %t261 = call i8* @strcat(i8* %t259, i8* %t250)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t259)
  %t262 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.15, i64 0, i64 0
  %t263 = load i1, i1* %boolTrue.var, align 8
  %t264 = load i1, i1* %boolFalse.var, align 8
  %t265 = or i1 %t263, %t264
  %t266 = call i8* @malloc(i64 64)
  %t267 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t268 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t269 = select i1 %t265, i8* %t267, i8* %t268
  %t270 = call i8* @strcpy(i8* %t266, i8* %t269)
  %t271 = call i64 @strlen(i8* %t262)
  %t272 = call i64 @strlen(i8* %t266)
  %t273 = add i64 %t271, %t272
  %t274 = add i64 %t273, 1
  %t275 = call i8* @malloc(i64 %t274)
  %t276 = call i8* @strcpy(i8* %t275, i8* %t262)
  %t277 = call i8* @strcat(i8* %t275, i8* %t266)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t275)
  %t278 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.16, i64 0, i64 0
  %t279 = load i1, i1* %boolFalse.var, align 8
  %t280 = xor i1 %t279, 1
  %t281 = call i8* @malloc(i64 64)
  %t282 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t283 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t284 = select i1 %t280, i8* %t282, i8* %t283
  %t285 = call i8* @strcpy(i8* %t281, i8* %t284)
  %t286 = call i64 @strlen(i8* %t278)
  %t287 = call i64 @strlen(i8* %t281)
  %t288 = add i64 %t286, %t287
  %t289 = add i64 %t288, 1
  %t290 = call i8* @malloc(i64 %t289)
  %t291 = call i8* @strcpy(i8* %t290, i8* %t278)
  %t292 = call i8* @strcat(i8* %t290, i8* %t281)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t290)
  %t293 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.17, i64 0, i64 0
  %t294 = load double, double* %intVal.var, align 8
  %t295 = fcmp oeq double %t294, 42.0
  %t296 = call i8* @malloc(i64 64)
  %t297 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t298 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t299 = select i1 %t295, i8* %t297, i8* %t298
  %t300 = call i8* @strcpy(i8* %t296, i8* %t299)
  %t301 = call i64 @strlen(i8* %t293)
  %t302 = call i64 @strlen(i8* %t296)
  %t303 = add i64 %t301, %t302
  %t304 = add i64 %t303, 1
  %t305 = call i8* @malloc(i64 %t304)
  %t306 = call i8* @strcpy(i8* %t305, i8* %t293)
  %t307 = call i8* @strcat(i8* %t305, i8* %t296)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t305)
  %t308 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.18, i64 0, i64 0
  %t309 = load double, double* %intVal.var, align 8
  %t310 = fcmp one double %t309, 42.0
  %t311 = call i8* @malloc(i64 64)
  %t312 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t313 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t314 = select i1 %t310, i8* %t312, i8* %t313
  %t315 = call i8* @strcpy(i8* %t311, i8* %t314)
  %t316 = call i64 @strlen(i8* %t308)
  %t317 = call i64 @strlen(i8* %t311)
  %t318 = add i64 %t316, %t317
  %t319 = add i64 %t318, 1
  %t320 = call i8* @malloc(i64 %t319)
  %t321 = call i8* @strcpy(i8* %t320, i8* %t308)
  %t322 = call i8* @strcat(i8* %t320, i8* %t311)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t320)
  %t323 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.19, i64 0, i64 0
  %t324 = fcmp olt double 10.0, 20.0
  %t325 = call i8* @malloc(i64 64)
  %t326 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t327 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t328 = select i1 %t324, i8* %t326, i8* %t327
  %t329 = call i8* @strcpy(i8* %t325, i8* %t328)
  %t330 = call i64 @strlen(i8* %t323)
  %t331 = call i64 @strlen(i8* %t325)
  %t332 = add i64 %t330, %t331
  %t333 = add i64 %t332, 1
  %t334 = call i8* @malloc(i64 %t333)
  %t335 = call i8* @strcpy(i8* %t334, i8* %t323)
  %t336 = call i8* @strcat(i8* %t334, i8* %t325)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t334)
  %t337 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.20, i64 0, i64 0
  %t338 = fcmp ole double 20.0, 20.0
  %t339 = call i8* @malloc(i64 64)
  %t340 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t341 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t342 = select i1 %t338, i8* %t340, i8* %t341
  %t343 = call i8* @strcpy(i8* %t339, i8* %t342)
  %t344 = call i64 @strlen(i8* %t337)
  %t345 = call i64 @strlen(i8* %t339)
  %t346 = add i64 %t344, %t345
  %t347 = add i64 %t346, 1
  %t348 = call i8* @malloc(i64 %t347)
  %t349 = call i8* @strcpy(i8* %t348, i8* %t337)
  %t350 = call i8* @strcat(i8* %t348, i8* %t339)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t348)
  %t351 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.21, i64 0, i64 0
  %t352 = fcmp ogt double 30.0, 20.0
  %t353 = call i8* @malloc(i64 64)
  %t354 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t355 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t356 = select i1 %t352, i8* %t354, i8* %t355
  %t357 = call i8* @strcpy(i8* %t353, i8* %t356)
  %t358 = call i64 @strlen(i8* %t351)
  %t359 = call i64 @strlen(i8* %t353)
  %t360 = add i64 %t358, %t359
  %t361 = add i64 %t360, 1
  %t362 = call i8* @malloc(i64 %t361)
  %t363 = call i8* @strcpy(i8* %t362, i8* %t351)
  %t364 = call i8* @strcat(i8* %t362, i8* %t353)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t362)
  %t365 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.22, i64 0, i64 0
  %t366 = fcmp oge double 30.0, 30.0
  %t367 = call i8* @malloc(i64 64)
  %t368 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t369 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t370 = select i1 %t366, i8* %t368, i8* %t369
  %t371 = call i8* @strcpy(i8* %t367, i8* %t370)
  %t372 = call i64 @strlen(i8* %t365)
  %t373 = call i64 @strlen(i8* %t367)
  %t374 = add i64 %t372, %t373
  %t375 = add i64 %t374, 1
  %t376 = call i8* @malloc(i64 %t375)
  %t377 = call i8* @strcpy(i8* %t376, i8* %t365)
  %t378 = call i8* @strcat(i8* %t376, i8* %t367)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t376)
  %t379 = getelementptr inbounds [34 x i8], [34 x i8]* @.str.23, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t379)
  %t380 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.24, i64 0, i64 0
  store i8* %t380, i8** %hello.var, align 8
  store i8* %t380, i8** @hello, align 8
  %t381 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.25, i64 0, i64 0
  store i8* %t381, i8** %world.var, align 8
  store i8* %t381, i8** @world, align 8
  %t382 = load i8*, i8** %hello.var, align 8
  %t383 = getelementptr inbounds [3 x i8], [3 x i8]* @.str.26, i64 0, i64 0
  %t384 = call i64 @strlen(i8* %t382)
  %t385 = call i64 @strlen(i8* %t383)
  %t386 = add i64 %t384, %t385
  %t387 = add i64 %t386, 1
  %t388 = call i8* @malloc(i64 %t387)
  %t389 = call i8* @strcpy(i8* %t388, i8* %t382)
  %t390 = call i8* @strcat(i8* %t388, i8* %t383)
  %t391 = load i8*, i8** %world.var, align 8
  %t392 = getelementptr inbounds [2 x i8], [2 x i8]* @.str.27, i64 0, i64 0
  %t393 = call i64 @strlen(i8* %t391)
  %t394 = call i64 @strlen(i8* %t392)
  %t395 = add i64 %t393, %t394
  %t396 = add i64 %t395, 1
  %t397 = call i8* @malloc(i64 %t396)
  %t398 = call i8* @strcpy(i8* %t397, i8* %t391)
  %t399 = call i8* @strcat(i8* %t397, i8* %t392)
  %t400 = call i64 @strlen(i8* %t388)
  %t401 = call i64 @strlen(i8* %t397)
  %t402 = add i64 %t400, %t401
  %t403 = add i64 %t402, 1
  %t404 = call i8* @malloc(i64 %t403)
  %t405 = call i8* @strcpy(i8* %t404, i8* %t388)
  %t406 = call i8* @strcat(i8* %t404, i8* %t397)
  store i8* %t404, i8** %joined.var, align 8
  store i8* %t404, i8** @joined, align 8
  %t407 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.28, i64 0, i64 0
  %t408 = load i8*, i8** %joined.var, align 8
  %t409 = call i64 @strlen(i8* %t407)
  %t410 = call i64 @strlen(i8* %t408)
  %t411 = add i64 %t409, %t410
  %t412 = add i64 %t411, 1
  %t413 = call i8* @malloc(i64 %t412)
  %t414 = call i8* @strcpy(i8* %t413, i8* %t407)
  %t415 = call i8* @strcat(i8* %t413, i8* %t408)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t413)
  %t416 = getelementptr inbounds [33 x i8], [33 x i8]* @.str.29, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t416)
  store double 10.0, double* %acc.var, align 8
  %t417 = fadd double 10.0, 0.0
  %t418 = bitcast double %t417 to i64
  %t419 = inttoptr i64 %t418 to i8*
  store i8* %t419, i8** @acc, align 8
  %t420 = load double, double* %acc.var, align 8
  %t421 = fadd double %t420, 15.0
  store double %t421, double* %acc.var, align 8
  %t422 = load double, double* %acc.var, align 8
  %t423 = fadd double %t422, 25.0
  store double %t423, double* %acc.var, align 8
  %t424 = load double, double* %acc.var, align 8
  %t425 = fsub double %t424, 10.0
  store double %t425, double* %acc.var, align 8
  %t426 = load double, double* %acc.var, align 8
  %t427 = fmul double %t426, 2.0
  store double %t427, double* %acc.var, align 8
  %t428 = load double, double* %acc.var, align 8
  %t429 = fdiv double %t428, 4.0
  store double %t429, double* %acc.var, align 8
  %t430 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.30, i64 0, i64 0
  %t431 = load double, double* %acc.var, align 8
  %t432 = call i8* @malloc(i64 64)
  %t433 = call i32 (i8*, i8*, ...) @sprintf(i8* %t432, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t431)
  %t434 = call i64 @strlen(i8* %t430)
  %t435 = call i64 @strlen(i8* %t432)
  %t436 = add i64 %t434, %t435
  %t437 = add i64 %t436, 1
  %t438 = call i8* @malloc(i64 %t437)
  %t439 = call i8* @strcpy(i8* %t438, i8* %t430)
  %t440 = call i8* @strcat(i8* %t438, i8* %t432)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t438)
  store double 7.0, double* %inner1.var, align 8
  store double 8.0, double* %inner2.var, align 8
  %t441 = load double, double* %inner1.var, align 8
  %t442 = load double, double* %inner2.var, align 8
  %t443 = fmul double %t441, %t442
  store double %t443, double* %blockResult.var, align 8
  %t444 = bitcast double %t443 to i64
  %t445 = inttoptr i64 %t444 to i8*
  store i8* %t445, i8** @blockResult, align 8
  %t446 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.31, i64 0, i64 0
  %t447 = load double, double* %blockResult.var, align 8
  %t448 = call i8* @malloc(i64 64)
  %t449 = call i32 (i8*, i8*, ...) @sprintf(i8* %t448, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t447)
  %t450 = call i64 @strlen(i8* %t446)
  %t451 = call i64 @strlen(i8* %t448)
  %t452 = add i64 %t450, %t451
  %t453 = add i64 %t452, 1
  %t454 = call i8* @malloc(i64 %t453)
  %t455 = call i8* @strcpy(i8* %t454, i8* %t446)
  %t456 = call i8* @strcat(i8* %t454, i8* %t448)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t454)
  %t457 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.32, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t457)
  %t458 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.33, i64 0, i64 0
  %t459 = call double @addTwo(double 18.0, double 24.0)
  %t460 = call i8* @malloc(i64 64)
  %t461 = call i32 (i8*, i8*, ...) @sprintf(i8* %t460, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t459)
  %t462 = call i64 @strlen(i8* %t458)
  %t463 = call i64 @strlen(i8* %t460)
  %t464 = add i64 %t462, %t463
  %t465 = add i64 %t464, 1
  %t466 = call i8* @malloc(i64 %t465)
  %t467 = call i8* @strcpy(i8* %t466, i8* %t458)
  %t468 = call i8* @strcat(i8* %t466, i8* %t460)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t466)
  %t469 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.34, i64 0, i64 0
  %t470 = call double @factorial(double 6.0)
  %t471 = call i8* @malloc(i64 64)
  %t472 = call i32 (i8*, i8*, ...) @sprintf(i8* %t471, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t470)
  %t473 = call i64 @strlen(i8* %t469)
  %t474 = call i64 @strlen(i8* %t471)
  %t475 = add i64 %t473, %t474
  %t476 = add i64 %t475, 1
  %t477 = call i8* @malloc(i64 %t476)
  %t478 = call i8* @strcpy(i8* %t477, i8* %t469)
  %t479 = call i8* @strcat(i8* %t477, i8* %t471)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t477)
  %t480 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.35, i64 0, i64 0
  %t481 = call double @fibonacci(double 8.0)
  %t482 = call i8* @malloc(i64 64)
  %t483 = call i32 (i8*, i8*, ...) @sprintf(i8* %t482, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t481)
  %t484 = call i64 @strlen(i8* %t480)
  %t485 = call i64 @strlen(i8* %t482)
  %t486 = add i64 %t484, %t485
  %t487 = add i64 %t486, 1
  %t488 = call i8* @malloc(i64 %t487)
  %t489 = call i8* @strcpy(i8* %t488, i8* %t480)
  %t490 = call i8* @strcat(i8* %t488, i8* %t482)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t488)
  %t491 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.36, i64 0, i64 0
  %t492 = call i1 @isEven(double 10.0)
  %t493 = call i8* @malloc(i64 64)
  %t494 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t495 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t496 = select i1 %t492, i8* %t494, i8* %t495
  %t497 = call i8* @strcpy(i8* %t493, i8* %t496)
  %t498 = call i64 @strlen(i8* %t491)
  %t499 = call i64 @strlen(i8* %t493)
  %t500 = add i64 %t498, %t499
  %t501 = add i64 %t500, 1
  %t502 = call i8* @malloc(i64 %t501)
  %t503 = call i8* @strcpy(i8* %t502, i8* %t491)
  %t504 = call i8* @strcat(i8* %t502, i8* %t493)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t502)
  %t505 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.37, i64 0, i64 0
  %t506 = call i1 @isOdd(double 10.0)
  %t507 = call i8* @malloc(i64 64)
  %t508 = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0
  %t509 = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0
  %t510 = select i1 %t506, i8* %t508, i8* %t509
  %t511 = call i8* @strcpy(i8* %t507, i8* %t510)
  %t512 = call i64 @strlen(i8* %t505)
  %t513 = call i64 @strlen(i8* %t507)
  %t514 = add i64 %t512, %t513
  %t515 = add i64 %t514, 1
  %t516 = call i8* @malloc(i64 %t515)
  %t517 = call i8* @strcpy(i8* %t516, i8* %t505)
  %t518 = call i8* @strcat(i8* %t516, i8* %t507)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t516)
  %t519 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.38, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t519)
  %t528 = bitcast i8* (i8*)* @.lambda_1 to i8*
  store i8* %t528, i8** %squareLambda.var, align 8
  store i8* %t528, i8** @squareLambda, align 8
  %t529 = getelementptr inbounds [19 x i8], [19 x i8]* @.str.39, i64 0, i64 0
  %t530 = load i8*, i8** %squareLambda.var, align 8
  %t531 = bitcast i8* %t530 to i8* (i8*)*
  %t532 = fadd double 9.0, 0.0
  %t533 = bitcast double %t532 to i64
  %t534 = inttoptr i64 %t533 to i8*
  %t535 = call i8* %t531(i8* %t534)
  %t536 = call i64 @strlen(i8* %t529)
  %t537 = call i64 @strlen(i8* %t535)
  %t538 = add i64 %t536, %t537
  %t539 = add i64 %t538, 1
  %t540 = call i8* @malloc(i64 %t539)
  %t541 = call i8* @strcpy(i8* %t540, i8* %t529)
  %t542 = call i8* @strcat(i8* %t540, i8* %t535)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t540)
  %t543 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.40, i64 0, i64 0
  %t544 = load i8*, i8** %squareLambda.var, align 8
  %t545 = call double @applyHigherOrder(i8* %t544, double 12.0)
  %t546 = call i8* @malloc(i64 64)
  %t547 = call i32 (i8*, i8*, ...) @sprintf(i8* %t546, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t545)
  %t548 = call i64 @strlen(i8* %t543)
  %t549 = call i64 @strlen(i8* %t546)
  %t550 = add i64 %t548, %t549
  %t551 = add i64 %t550, 1
  %t552 = call i8* @malloc(i64 %t551)
  %t553 = call i8* @strcpy(i8* %t552, i8* %t543)
  %t554 = call i8* @strcat(i8* %t552, i8* %t546)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t552)
  %t555 = getelementptr inbounds [23 x i8], [23 x i8]* @.str.41, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t555)
  %t556 = load double, double* %intVal.var, align 8
  %t557 = fcmp ogt double %t556, 40.0
  br i1 %t557, label %then.25, label %else.26
then.25:
  %t558 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.42, i64 0, i64 0
  br label %if.merge.27
else.26:
  %t559 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.43, i64 0, i64 0
  br label %if.merge.27
if.merge.27:
  %t560 = phi i8* [ %t558, %then.25 ], [ %t559, %else.26 ]
  store i8* %t560, i8** %ternaryVal.var, align 8
  store i8* %t560, i8** @ternaryVal, align 8
  %t561 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.44, i64 0, i64 0
  %t562 = load i8*, i8** %ternaryVal.var, align 8
  %t563 = call i64 @strlen(i8* %t561)
  %t564 = call i64 @strlen(i8* %t562)
  %t565 = add i64 %t563, %t564
  %t566 = add i64 %t565, 1
  %t567 = call i8* @malloc(i64 %t566)
  %t568 = call i8* @strcpy(i8* %t567, i8* %t561)
  %t569 = call i8* @strcat(i8* %t567, i8* %t562)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t567)
  store double 0.0, double* %loopSum.var, align 8
  %t570 = fadd double 0.0, 0.0
  %t571 = bitcast double %t570 to i64
  %t572 = inttoptr i64 %t571 to i8*
  store i8* %t572, i8** @loopSum, align 8
  store double 1.0, double* %counter.var, align 8
  %t573 = fadd double 1.0, 0.0
  %t574 = bitcast double %t573 to i64
  %t575 = inttoptr i64 %t574 to i8*
  store i8* %t575, i8** @counter, align 8
  br label %while.cond.28
while.cond.28:
  %t576 = load double, double* %counter.var, align 8
  %t577 = fcmp ole double %t576, 5.0
  br i1 %t577, label %while.body.29, label %while.merge.30
while.body.29:
  %t578 = load double, double* %counter.var, align 8
  %t579 = load double, double* %loopSum.var, align 8
  %t580 = fadd double %t579, %t578
  store double %t580, double* %loopSum.var, align 8
  %t581 = load double, double* %counter.var, align 8
  %t582 = fadd double %t581, 1.0
  store double %t582, double* %counter.var, align 8
  br label %while.cond.28
while.merge.30:
  %t583 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.45, i64 0, i64 0
  %t584 = load double, double* %loopSum.var, align 8
  %t585 = call i8* @malloc(i64 64)
  %t586 = call i32 (i8*, i8*, ...) @sprintf(i8* %t585, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t584)
  %t587 = call i64 @strlen(i8* %t583)
  %t588 = call i64 @strlen(i8* %t585)
  %t589 = add i64 %t587, %t588
  %t590 = add i64 %t589, 1
  %t591 = call i8* @malloc(i64 %t590)
  %t592 = call i8* @strcpy(i8* %t591, i8* %t583)
  %t593 = call i8* @strcat(i8* %t591, i8* %t585)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t591)
  store double 0.0, double* %breakSum.var, align 8
  %t594 = fadd double 0.0, 0.0
  %t595 = bitcast double %t594 to i64
  %t596 = inttoptr i64 %t595 to i8*
  store i8* %t596, i8** @breakSum, align 8
  store double 0.0, double* %bIndex.var, align 8
  %t597 = fadd double 0.0, 0.0
  %t598 = bitcast double %t597 to i64
  %t599 = inttoptr i64 %t598 to i8*
  store i8* %t599, i8** @bIndex, align 8
  br label %while.cond.31
while.cond.31:
  %t600 = load double, double* %bIndex.var, align 8
  %t601 = fcmp olt double %t600, 20.0
  br i1 %t601, label %while.body.32, label %while.merge.33
while.body.32:
  %t602 = load double, double* %bIndex.var, align 8
  %t603 = fadd double %t602, 1.0
  store double %t603, double* %bIndex.var, align 8
  %t604 = load double, double* %bIndex.var, align 8
  %t605 = fcmp ogt double %t604, 6.0
  br i1 %t605, label %then.34, label %else.35
then.34:
  br label %while.merge.33
dead.break.37:
  br label %if.merge.36
else.35:
  br label %if.merge.36
if.merge.36:
  %t606 = load double, double* %bIndex.var, align 8
  %t607 = fcmp oeq double %t606, 3.0
  br i1 %t607, label %then.38, label %else.39
then.38:
  br label %while.cond.31
dead.continue.41:
  br label %if.merge.40
else.39:
  br label %if.merge.40
if.merge.40:
  %t608 = load double, double* %bIndex.var, align 8
  %t609 = load double, double* %breakSum.var, align 8
  %t610 = fadd double %t609, %t608
  store double %t610, double* %breakSum.var, align 8
  br label %while.cond.31
while.merge.33:
  %t611 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.46, i64 0, i64 0
  %t612 = load double, double* %breakSum.var, align 8
  %t613 = call i8* @malloc(i64 64)
  %t614 = call i32 (i8*, i8*, ...) @sprintf(i8* %t613, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t612)
  %t615 = call i64 @strlen(i8* %t611)
  %t616 = call i64 @strlen(i8* %t613)
  %t617 = add i64 %t615, %t616
  %t618 = add i64 %t617, 1
  %t619 = call i8* @malloc(i64 %t618)
  %t620 = call i8* @strcpy(i8* %t619, i8* %t611)
  %t621 = call i8* @strcat(i8* %t619, i8* %t613)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t619)
  br label %switch.cond.43
switch.cond.43:
  %t622 = fcmp oeq double 3.0, 1.0
  br i1 %t622, label %switch.body0.44, label %switch.case_next1.45
switch.body0.44:
  %t623 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.47, i64 0, i64 0
  br label %switch.merge.42
switch.case_next1.45:
  %t624 = fcmp oeq double 3.0, 2.0
  br i1 %t624, label %switch.body1.46, label %switch.case_next2.47
switch.body1.46:
  %t625 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.48, i64 0, i64 0
  br label %switch.merge.42
switch.case_next2.47:
  %t626 = fcmp oeq double 3.0, 3.0
  br i1 %t626, label %switch.body2.48, label %switch.case_next3.49
switch.body2.48:
  %t627 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.49, i64 0, i64 0
  br label %switch.merge.42
switch.case_next3.49:
  %t628 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.50, i64 0, i64 0
  br label %switch.merge.42
switch.merge.42:
  %t629 = phi i8* [ %t623, %switch.body0.44 ], [ %t625, %switch.body1.46 ], [ %t627, %switch.body2.48 ], [ %t628, %switch.case_next3.49 ]
  store i8* %t629, i8** %switchResult.var, align 8
  store i8* %t629, i8** @switchResult, align 8
  %t630 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.51, i64 0, i64 0
  %t631 = load i8*, i8** %switchResult.var, align 8
  %t632 = call i64 @strlen(i8* %t630)
  %t633 = call i64 @strlen(i8* %t631)
  %t634 = add i64 %t632, %t633
  %t635 = add i64 %t634, 1
  %t636 = call i8* @malloc(i64 %t635)
  %t637 = call i8* @strcpy(i8* %t636, i8* %t630)
  %t638 = call i8* @strcat(i8* %t636, i8* %t631)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t636)
  %t639 = getelementptr inbounds [31 x i8], [31 x i8]* @.str.52, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t639)
  %t640 = getelementptr inbounds [17 x i8], [17 x i8]* @.str.53, i64 0, i64 0
  %t641 = call double @MathHelper_cube(double 4.0)
  %t642 = call i8* @malloc(i64 64)
  %t643 = call i32 (i8*, i8*, ...) @sprintf(i8* %t642, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t641)
  %t644 = call i64 @strlen(i8* %t640)
  %t645 = call i64 @strlen(i8* %t642)
  %t646 = add i64 %t644, %t645
  %t647 = add i64 %t646, 1
  %t648 = call i8* @malloc(i64 %t647)
  %t649 = call i8* @strcpy(i8* %t648, i8* %t640)
  %t650 = call i8* @strcat(i8* %t648, i8* %t642)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t648)
  %t651 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.54, i64 0, i64 0
  %t652 = call double @MathHelper_NestedGeometry_area(double 5.0, double 7.0)
  %t653 = call i8* @malloc(i64 64)
  %t654 = call i32 (i8*, i8*, ...) @sprintf(i8* %t653, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t652)
  %t655 = call i64 @strlen(i8* %t651)
  %t656 = call i64 @strlen(i8* %t653)
  %t657 = add i64 %t655, %t656
  %t658 = add i64 %t657, 1
  %t659 = call i8* @malloc(i64 %t658)
  %t660 = call i8* @strcpy(i8* %t659, i8* %t651)
  %t661 = call i8* @strcat(i8* %t659, i8* %t653)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t659)
  %t662 = getelementptr inbounds [24 x i8], [24 x i8]* @.str.55, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t662)
  %t663 = getelementptr inbounds [19 x i8], [19 x i8]* @.str.56, i64 0, i64 0
  %t664 = call double @computeWhere(double 25.0)
  %t665 = call i8* @malloc(i64 64)
  %t666 = call i32 (i8*, i8*, ...) @sprintf(i8* %t665, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t664)
  %t667 = call i64 @strlen(i8* %t663)
  %t668 = call i64 @strlen(i8* %t665)
  %t669 = add i64 %t667, %t668
  %t670 = add i64 %t669, 1
  %t671 = call i8* @malloc(i64 %t670)
  %t672 = call i8* @strcpy(i8* %t671, i8* %t663)
  %t673 = call i8* @strcat(i8* %t671, i8* %t665)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t671)
  %t674 = getelementptr inbounds [24 x i8], [24 x i8]* @.str.57, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t674)
  %t675 = getelementptr inbounds [11 x i8], [11 x i8]* @.str.58, i64 0, i64 0
  %t676 = call double @llvm.sqrt.f64(double 64.0)
  %t677 = call i8* @malloc(i64 64)
  %t678 = call i32 (i8*, i8*, ...) @sprintf(i8* %t677, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t676)
  %t679 = call i64 @strlen(i8* %t675)
  %t680 = call i64 @strlen(i8* %t677)
  %t681 = add i64 %t679, %t680
  %t682 = add i64 %t681, 1
  %t683 = call i8* @malloc(i64 %t682)
  %t684 = call i8* @strcpy(i8* %t683, i8* %t675)
  %t685 = call i8* @strcat(i8* %t683, i8* %t677)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t683)
  %t686 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.59, i64 0, i64 0
  %t687 = call double @llvm.floor.f64(double 9.87)
  %t688 = call i8* @malloc(i64 64)
  %t689 = call i32 (i8*, i8*, ...) @sprintf(i8* %t688, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t687)
  %t690 = call i64 @strlen(i8* %t686)
  %t691 = call i64 @strlen(i8* %t688)
  %t692 = add i64 %t690, %t691
  %t693 = add i64 %t692, 1
  %t694 = call i8* @malloc(i64 %t693)
  %t695 = call i8* @strcpy(i8* %t694, i8* %t686)
  %t696 = call i8* @strcat(i8* %t694, i8* %t688)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t694)
  %t697 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.60, i64 0, i64 0
  %t698 = fneg double 42.5
  %t699 = call double @llvm.fabs.f64(double %t698)
  %t700 = call i8* @malloc(i64 64)
  %t701 = call i32 (i8*, i8*, ...) @sprintf(i8* %t700, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t699)
  %t702 = call i64 @strlen(i8* %t697)
  %t703 = call i64 @strlen(i8* %t700)
  %t704 = add i64 %t702, %t703
  %t705 = add i64 %t704, 1
  %t706 = call i8* @malloc(i64 %t705)
  %t707 = call i8* @strcpy(i8* %t706, i8* %t697)
  %t708 = call i8* @strcat(i8* %t706, i8* %t700)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t706)
  %t709 = getelementptr inbounds [35 x i8], [35 x i8]* @.str.61, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t709)
  ; GADT Sum Type Definition: Color
  ;   Constructor [0]: Red()
  ;   Constructor [1]: Green()
  ;   Constructor [2]: Blue()
  %t710 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.62, i64 0, i64 0
  %t711 = call i8* @malloc(i64 16)
  %t712 = bitcast i8* %t711 to %struct.GADTValue*
  %t713 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t712, i32 0, i32 0
  store i32 0, i32* %t713, align 4
  %t714 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t712, i32 0, i32 1
  store i8* null, i8** %t714, align 8
  %t715 = call double @colorToCode(%struct.GADTValue* %t712)
  %t716 = call i8* @malloc(i64 64)
  %t717 = call i32 (i8*, i8*, ...) @sprintf(i8* %t716, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t715)
  %t718 = call i64 @strlen(i8* %t710)
  %t719 = call i64 @strlen(i8* %t716)
  %t720 = add i64 %t718, %t719
  %t721 = add i64 %t720, 1
  %t722 = call i8* @malloc(i64 %t721)
  %t723 = call i8* @strcpy(i8* %t722, i8* %t710)
  %t724 = call i8* @strcat(i8* %t722, i8* %t716)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t722)
  %t725 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.63, i64 0, i64 0
  %t726 = call i8* @malloc(i64 16)
  %t727 = bitcast i8* %t726 to %struct.GADTValue*
  %t728 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t727, i32 0, i32 0
  store i32 1, i32* %t728, align 4
  %t729 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t727, i32 0, i32 1
  store i8* null, i8** %t729, align 8
  %t730 = call double @colorToCode(%struct.GADTValue* %t727)
  %t731 = call i8* @malloc(i64 64)
  %t732 = call i32 (i8*, i8*, ...) @sprintf(i8* %t731, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t730)
  %t733 = call i64 @strlen(i8* %t725)
  %t734 = call i64 @strlen(i8* %t731)
  %t735 = add i64 %t733, %t734
  %t736 = add i64 %t735, 1
  %t737 = call i8* @malloc(i64 %t736)
  %t738 = call i8* @strcpy(i8* %t737, i8* %t725)
  %t739 = call i8* @strcat(i8* %t737, i8* %t731)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t737)
  %t740 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.64, i64 0, i64 0
  %t741 = call i8* @malloc(i64 16)
  %t742 = bitcast i8* %t741 to %struct.GADTValue*
  %t743 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t742, i32 0, i32 0
  store i32 2, i32* %t743, align 4
  %t744 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t742, i32 0, i32 1
  store i8* null, i8** %t744, align 8
  %t745 = call double @colorToCode(%struct.GADTValue* %t742)
  %t746 = call i8* @malloc(i64 64)
  %t747 = call i32 (i8*, i8*, ...) @sprintf(i8* %t746, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t745)
  %t748 = call i64 @strlen(i8* %t740)
  %t749 = call i64 @strlen(i8* %t746)
  %t750 = add i64 %t748, %t749
  %t751 = add i64 %t750, 1
  %t752 = call i8* @malloc(i64 %t751)
  %t753 = call i8* @strcpy(i8* %t752, i8* %t740)
  %t754 = call i8* @strcat(i8* %t752, i8* %t746)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t752)
  ; GADT Sum Type Definition: MaybeNum
  ;   Constructor [0]: Some(val)
  ;   Constructor [1]: None()
  %t755 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.65, i64 0, i64 0
  %t756 = call i8* @malloc(i64 16)
  %t757 = bitcast i8* %t756 to %struct.GADTValue*
  %t758 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t757, i32 0, i32 0
  store i32 0, i32* %t758, align 4
  %t759 = call i8* @malloc(i64 8)
  %t760 = fadd double 88.0, 0.0
  %t761 = bitcast double %t760 to i64
  %t762 = inttoptr i64 %t761 to i8*
  %t763 = getelementptr inbounds i8, i8* %t759, i64 0
  %t764 = bitcast i8* %t763 to i8**
  store i8* %t762, i8** %t764, align 8
  %t765 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t757, i32 0, i32 1
  store i8* %t759, i8** %t765, align 8
  %t766 = call double @getWithDefault(%struct.GADTValue* %t757, double 0.0)
  %t767 = call i8* @malloc(i64 64)
  %t768 = call i32 (i8*, i8*, ...) @sprintf(i8* %t767, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t766)
  %t769 = call i64 @strlen(i8* %t755)
  %t770 = call i64 @strlen(i8* %t767)
  %t771 = add i64 %t769, %t770
  %t772 = add i64 %t771, 1
  %t773 = call i8* @malloc(i64 %t772)
  %t774 = call i8* @strcpy(i8* %t773, i8* %t755)
  %t775 = call i8* @strcat(i8* %t773, i8* %t767)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t773)
  %t776 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.66, i64 0, i64 0
  %t777 = call i8* @malloc(i64 16)
  %t778 = bitcast i8* %t777 to %struct.GADTValue*
  %t779 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t778, i32 0, i32 0
  store i32 1, i32* %t779, align 4
  %t780 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t778, i32 0, i32 1
  store i8* null, i8** %t780, align 8
  %t781 = call double @getWithDefault(%struct.GADTValue* %t778, double 99.0)
  %t782 = call i8* @malloc(i64 64)
  %t783 = call i32 (i8*, i8*, ...) @sprintf(i8* %t782, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double %t781)
  %t784 = call i64 @strlen(i8* %t776)
  %t785 = call i64 @strlen(i8* %t782)
  %t786 = add i64 %t784, %t785
  %t787 = add i64 %t786, 1
  %t788 = call i8* @malloc(i64 %t787)
  %t789 = call i8* @strcpy(i8* %t788, i8* %t776)
  %t790 = call i8* @strcat(i8* %t788, i8* %t782)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t788)
  %t791 = getelementptr inbounds [52 x i8], [52 x i8]* @.str.67, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t791)
  ret i32 0
}