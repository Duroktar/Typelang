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

; --- Interned String Literals ---
@.str.0 = private unnamed_addr constant [8 x i8] c"Hello, \00", align 1
@.str.1 = private unnamed_addr constant [7 x i8] c"rank-2\00", align 1
@.str.2 = private unnamed_addr constant [21 x i8] c"case 1 falls through\00", align 1
@.str.3 = private unnamed_addr constant [15 x i8] c"case 2 reached\00", align 1
@.str.4 = private unnamed_addr constant [16 x i8] c"default reached\00", align 1
@.str.5 = private unnamed_addr constant [13 x i8] c"large circle\00", align 1
@.str.6 = private unnamed_addr constant [13 x i8] c"small circle\00", align 1
@.str.7 = private unnamed_addr constant [7 x i8] c"square\00", align 1
@.str.8 = private unnamed_addr constant [10 x i8] c"rectangle\00", align 1
@.str.9 = private unnamed_addr constant [4 x i8] c"dot\00", align 1
@.str.10 = private unnamed_addr constant [12 x i8] c"other shape\00", align 1
@.str.11 = private unnamed_addr constant [5 x i8] c"name\00", align 1
@.str.12 = private unnamed_addr constant [4 x i8] c"age\00", align 1
@.str.13 = private unnamed_addr constant [5 x i8] c"zero\00", align 1
@.str.14 = private unnamed_addr constant [4 x i8] c"one\00", align 1
@.str.15 = private unnamed_addr constant [8 x i8] c"number \00", align 1
@.str.16 = private unnamed_addr constant [6 x i8] c"found\00", align 1
@.str.17 = private unnamed_addr constant [7 x i8] c"value=\00", align 1
@.str.18 = private unnamed_addr constant [4 x i8] c"Ada\00", align 1
@.str.19 = private unnamed_addr constant [6 x i8] c"score\00", align 1
@.str.20 = private unnamed_addr constant [6 x i8] c"three\00", align 1
@.str.21 = private unnamed_addr constant [6 x i8] c"ready\00", align 1
@.str.22 = private unnamed_addr constant [8 x i8] c"waiting\00", align 1
@.str.23 = private unnamed_addr constant [9 x i8] c"positive\00", align 1
@.str.24 = private unnamed_addr constant [8 x i8] c"weekday\00", align 1
@.str.25 = private unnamed_addr constant [8 x i8] c"weekend\00", align 1
@.str.26 = private unnamed_addr constant [8 x i8] c"unknown\00", align 1
@.str.27 = private unnamed_addr constant [8 x i8] c"flatMap\00", align 1
@.str.28 = private unnamed_addr constant [5 x i8] c"pure\00", align 1
@.str.29 = private unnamed_addr constant [39 x i8] c"=== Ultimate TypeLang Feature Tour ===\00", align 1
@.str.30 = private unnamed_addr constant [19 x i8] c"line\5Cnnext\5Ctcolumn\00", align 1
@.str.31 = private unnamed_addr constant [25 x i8] c"module/import + helper: \00", align 1
@.str.32 = private unnamed_addr constant [23 x i8] c"module alias + block: \00", align 1
@.str.33 = private unnamed_addr constant [9 x i8] c"TypeLang\00", align 1
@.str.34 = private unnamed_addr constant [23 x i8] c"record method/update: \00", align 1
@.str.35 = private unnamed_addr constant [27 x i8] c"shorthand/if-then/return: \00", align 1
@.str.36 = private unnamed_addr constant [21 x i8] c"generic pair/index: \00", align 1
@.str.37 = private unnamed_addr constant [31 x i8] c"comprehension + range + fold: \00", align 1
@.str.38 = private unnamed_addr constant [21 x i8] c"operators/if/loops: \00", align 1
@.str.39 = private unnamed_addr constant [9 x i8] c"switch: \00", align 1
@.str.40 = private unnamed_addr constant [13 x i8] c"match/GADT: \00", align 1
@.str.41 = private unnamed_addr constant [32 x i8] c"tuple/record/literal patterns: \00", align 1
@.str.42 = private unnamed_addr constant [22 x i8] c"existential package: \00", align 1
@.str.43 = private unnamed_addr constant [14 x i8] c"higher-rank: \00", align 1
@.str.44 = private unnamed_addr constant [19 x i8] c"stdlib/Option/do: \00", align 1
@.str.45 = private unnamed_addr constant [45 x i8] c"do-return/omitted return annotation/escape: \00", align 1
@.str.46 = private unnamed_addr constant [20 x i8] c"String/Math/Array: \00", align 1
@.str.47 = private unnamed_addr constant [27 x i8] c"where/return/switch flow: \00", align 1

; --- Global and Module Variables ---
@shortLambda = global i8* null, align 8
@typedUser = global %struct.GADTValue* null, align 8
@name = global i8* null, align 8
@shorthandRecord = global i8* null, align 8
@user = global i8* null, align 8
@revisedUser = global i8* null, align 8
@pair = global i8* null, align 8
@numbers = global %struct.Array* null, align 8
@first = global i8* null, align 8
@oddsSquared = global i8* null, align 8
@exclusiveRange = global i8* null, align 8
@total = global i8* null, align 8
@counter = global double 0.0, align 8
@logical = global i8* null, align 8
@label = global i8* null, align 8
@blockValue = global i8* null, align 8
@thenValue = global i8* null, align 8
@loopTotal = global i8* null, align 8
@countdown = global i8* null, align 8
@dayKind = global i8* null, align 8
@selectedText = global i8* null, align 8
@clipped = global i8* null, align 8
@maybe = global %struct.GADTValue* null, align 8
@maybeText = global i8* null, align 8
@computation = global i8* null, align 8
@returnedComputation = global i8* null, align 8
@scopedResult = global i8* null, align 8
@escapedText = global i8* null, align 8
@rankResults = global i8* null, align 8

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
declare double @Math_min(double, i8*)
declare double @Option_Some(double)
declare double @Option_map(double, i8*)
declare double @squareFromKit(double)
declare double @UK_square(double)
declare double @greet(i8*)
declare double @Option_getOrElse(i8*, double)


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

define internal i8* @.lambda_1(i8* %arg.value) {
entry:
  %t236 = alloca double, align 8
  %t237 = ptrtoint i8* %arg.value to i64
  %t238 = bitcast i64 %t237 to double
  store double %t238, double* %t236, align 8
  %t239 = load double, double* %t236, align 8
  %t240 = fmul double %t239, 3.0
  %t241 = bitcast double %t240 to i64
  %t242 = inttoptr i64 %t241 to i8*
  ret i8* %t242
}

define internal i8* @.lambda_2(i8* %arg.n) {
entry:
  %t478 = alloca double, align 8
  %t479 = ptrtoint i8* %arg.n to i64
  %t480 = bitcast i64 %t479 to double
  store double %t480, double* %t478, align 8
  %t481 = load double, double* %t478, align 8
  %t482 = call i8* @malloc(i64 64)
  %t483 = call i32 (i8*, i8*, ...) @sprintf(i8* %t482, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t481)
  ret i8* %t482
}

define internal i8* @.lambda_3(i8* %arg.n) {
entry:
  %t486 = alloca double, align 8
  %t487 = ptrtoint i8* %arg.n to i64
  %t488 = bitcast i64 %t487 to double
  store double %t488, double* %t486, align 8
  %t489 = load double, double* %t486, align 8
  %t490 = call i8* @malloc(i64 64)
  %t491 = call i32 (i8*, i8*, ...) @sprintf(i8* %t490, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t489)
  ret i8* %t490
}

define internal i8* @.lambda_4(i8* %arg.value) {
entry:
  %t502 = alloca double, align 8
  %incremented.var = alloca double, align 8
  %t503 = ptrtoint i8* %arg.value to i64
  %t504 = bitcast i64 %t503 to double
  store double %t504, double* %t502, align 8
  %t505 = load double, double* %t502, align 8
  %t506 = fadd double %t505, 1.0
  store double %t506, double* %incremented.var, align 8
  %t507 = fadd double 0.0, 0.0
  %t508 = bitcast double %t507 to i64
  %t509 = inttoptr i64 %t508 to i8*
  %t510 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.28, i64 0, i64 0
  %t511 = call i8* @_tl_record_get(i8* %t509, i8* %t510)
  %t512 = load double, double* %incremented.var, align 8
  %t513 = fmul double %t512, 2.0
  %t514 = bitcast i8* %t511 to i8* (i8*)*
  %t515 = bitcast double %t513 to i64
  %t516 = inttoptr i64 %t515 to i8*
  %t517 = call i8* %t514(i8* %t516)
  ret i8* %t517
}

define internal i8* @.lambda_5(i8* %arg.n) {
entry:
  %t778 = alloca double, align 8
  %t779 = ptrtoint i8* %arg.n to i64
  %t780 = bitcast i64 %t779 to double
  store double %t780, double* %t778, align 8
  %t781 = load double, double* %t778, align 8
  %t782 = call i8* @malloc(i64 64)
  %t783 = call i32 (i8*, i8*, ...) @sprintf(i8* %t782, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t781)
  ret i8* %t782
}

define double @UltimateKit_square(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t1 = load double, double* %n.addr, align 8
  %t2 = load double, double* %n.addr, align 8
  %t3 = fmul double %t1, %t2
  ret double %t3
}

define i8* @UltimateKit_Text_greet(i8* %arg.who) {
entry:
  %who.addr = alloca i8*, align 8
  store i8* %arg.who, i8** %who.addr, align 8
  %t4 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.0, i64 0, i64 0
  %t5 = load i8*, i8** %who.addr, align 8
  %t6 = call i64 @strlen(i8* %t4)
  %t7 = call i64 @strlen(i8* %t5)
  %t8 = add i64 %t6, %t7
  %t9 = add i64 %t8, 1
  %t10 = call i8* @malloc(i64 %t9)
  %t11 = call i8* @strcpy(i8* %t10, i8* %t4)
  %t12 = call i8* @strcat(i8* %t10, i8* %t5)
  ret i8* %t10
}

define double @evaluateNumber(%struct.GADTValue* %arg.term) {
entry:
  %term.addr = alloca %struct.GADTValue*, align 8
  %t21 = alloca i8*, align 8
  %t28 = alloca i8*, align 8
  %t32 = alloca i8*, align 8
  store %struct.GADTValue* %arg.term, %struct.GADTValue** %term.addr, align 8
  %t13 = load %struct.GADTValue*, %struct.GADTValue** %term.addr, align 8
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
  %t35 = call double @evaluateNumber(%struct.GADTValue* %t34)
  %t36 = load i8*, i8** %t32, align 8
  %t37 = bitcast i8* %t36 to %struct.GADTValue*
  %t38 = call double @evaluateNumber(%struct.GADTValue* %t37)
  %t39 = fadd double %t35, %t38
  br label %match.merge.2
match.default.1:
  br label %match.merge.2
match.merge.2:
  %t43 = phi double [ %t40, %match.arm0.3 ], [ %t39, %match.arm1.4 ], [ 0.0, %match.default.1 ]
  ret double %t43
}

define void @printPlusOne(double %arg.value) {
entry:
  %value.addr = alloca double, align 8
  store double %arg.value, double* %value.addr, align 8
  %t44 = load double, double* %value.addr, align 8
  %t45 = fadd double %t44, 1.0
  %t46 = call i8* @malloc(i64 64)
  %t47 = call i32 (i8*, i8*, ...) @sprintf(i8* %t46, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t45)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t46)
  ret void
}

define double @earlyReturn(double %arg.value) {
entry:
  %value.addr = alloca double, align 8
  store double %arg.value, double* %value.addr, align 8
  %t48 = load double, double* %value.addr, align 8
  %t49 = fcmp ogt double %t48, 0.0
  br i1 %t49, label %then.5, label %else.6
then.5:
  %t50 = load double, double* %value.addr, align 8
  br label %if.merge.7
else.6:
  br label %if.merge.7
if.merge.7:
  ret double 0.0
}

define void @bareReturn() {
entry:
  ret void
}

define i8* @usePolymorphic(i8* %arg.f) {
entry:
  %f.addr = alloca i8*, align 8
  store i8* %arg.f, i8** %f.addr, align 8
  %t51 = call i8* @malloc(i64 16)
  %t52 = bitcast i8* %t51 to %struct.Array*
  %t53 = getelementptr inbounds %struct.Array, %struct.Array* %t52, i32 0, i32 0
  store i64 2, i64* %t53, align 8
  %t54 = call i8* @malloc(i64 16)
  %t55 = load i8*, i8** %f.addr, align 8
  %t56 = bitcast i8* %t55 to i8* (i8*)*
  %t57 = fadd double 7.0, 0.0
  %t58 = bitcast double %t57 to i64
  %t59 = inttoptr i64 %t58 to i8*
  %t60 = call i8* %t56(i8* %t59)
  %t61 = getelementptr inbounds i8, i8* %t54, i64 0
  %t62 = bitcast i8* %t61 to i8**
  store i8* %t60, i8** %t62, align 8
  %t63 = load i8*, i8** %f.addr, align 8
  %t64 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.1, i64 0, i64 0
  %t65 = bitcast i8* %t63 to i8* (i8*)*
  %t66 = call i8* %t65(i8* %t64)
  %t67 = getelementptr inbounds i8, i8* %t54, i64 8
  %t68 = bitcast i8* %t67 to i8**
  store i8* %t66, i8** %t68, align 8
  %t69 = getelementptr inbounds %struct.Array, %struct.Array* %t52, i32 0, i32 1
  %t70 = bitcast i8* %t54 to i8**
  store i8** %t70, i8*** %t69, align 8
  %t71 = bitcast %struct.Array* %t52 to i8*
  ret i8* %t71
}

define %struct.GADTValue* @identity(%struct.GADTValue* %arg.value) {
entry:
  %value.addr = alloca %struct.GADTValue*, align 8
  store %struct.GADTValue* %arg.value, %struct.GADTValue** %value.addr, align 8
  %t72 = load %struct.GADTValue*, %struct.GADTValue** %value.addr, align 8
  ret %struct.GADTValue* %t72
}

define %struct.GADTValue* @makePair(%struct.GADTValue* %arg.left, %struct.GADTValue* %arg.right) {
entry:
  %left.addr = alloca %struct.GADTValue*, align 8
  %right.addr = alloca %struct.GADTValue*, align 8
  store %struct.GADTValue* %arg.left, %struct.GADTValue** %left.addr, align 8
  store %struct.GADTValue* %arg.right, %struct.GADTValue** %right.addr, align 8
  %t73 = call i8* @malloc(i64 16)
  %t74 = bitcast i8* %t73 to %struct.Array*
  %t75 = getelementptr inbounds %struct.Array, %struct.Array* %t74, i32 0, i32 0
  store i64 2, i64* %t75, align 8
  %t76 = call i8* @malloc(i64 16)
  %t77 = load %struct.GADTValue*, %struct.GADTValue** %left.addr, align 8
  %t78 = bitcast %struct.GADTValue* %t77 to i8*
  %t79 = getelementptr inbounds i8, i8* %t76, i64 0
  %t80 = bitcast i8* %t79 to i8**
  store i8* %t78, i8** %t80, align 8
  %t81 = load %struct.GADTValue*, %struct.GADTValue** %right.addr, align 8
  %t82 = bitcast %struct.GADTValue* %t81 to i8*
  %t83 = getelementptr inbounds i8, i8* %t76, i64 8
  %t84 = bitcast i8* %t83 to i8**
  store i8* %t82, i8** %t84, align 8
  %t85 = getelementptr inbounds %struct.Array, %struct.Array* %t74, i32 0, i32 1
  %t86 = bitcast i8* %t76 to i8**
  store i8** %t86, i8*** %t85, align 8
  %t87 = bitcast %struct.Array* %t74 to i8*
  %t88 = bitcast i8* %t87 to %struct.GADTValue*
  ret %struct.GADTValue* %t88
}

define %struct.GADTValue* @apply(i8* %arg.callback, %struct.GADTValue* %arg.value) {
entry:
  %callback.addr = alloca i8*, align 8
  %value.addr = alloca %struct.GADTValue*, align 8
  store i8* %arg.callback, i8** %callback.addr, align 8
  store %struct.GADTValue* %arg.value, %struct.GADTValue** %value.addr, align 8
  %t89 = load i8*, i8** %callback.addr, align 8
  %t90 = load %struct.GADTValue*, %struct.GADTValue** %value.addr, align 8
  %t91 = bitcast i8* %t89 to i8* (i8*)*
  %t92 = bitcast %struct.GADTValue* %t90 to i8*
  %t93 = call i8* %t91(i8* %t92)
  %t94 = bitcast i8* %t93 to %struct.GADTValue*
  ret %struct.GADTValue* %t94
}

define i8* @showPacked(%struct.GADTValue* %arg.value) {
entry:
  %value.addr = alloca %struct.GADTValue*, align 8
  %t103 = alloca i8*, align 8
  %t107 = alloca i8*, align 8
  store %struct.GADTValue* %arg.value, %struct.GADTValue** %value.addr, align 8
  %t95 = load %struct.GADTValue*, %struct.GADTValue** %value.addr, align 8
  %t97 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t95, i32 0, i32 0
  %t96 = load i32, i32* %t97, align 4
  switch i32 %t96, label %match.default.8 [ i32 0, label %match.arm0.10 ]
match.arm0.10:
  %t98 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t95, i32 0, i32 1
  %t99 = load i8*, i8** %t98, align 8
  %t100 = getelementptr inbounds i8, i8* %t99, i64 0
  %t101 = bitcast i8* %t100 to i8**
  %t102 = load i8*, i8** %t101, align 8
  store i8* %t102, i8** %t103, align 8
  %t104 = getelementptr inbounds i8, i8* %t99, i64 8
  %t105 = bitcast i8* %t104 to i8**
  %t106 = load i8*, i8** %t105, align 8
  store i8* %t106, i8** %t107, align 8
  %t108 = load i8*, i8** %t107, align 8
  %t109 = load i8*, i8** %t103, align 8
  %t110 = bitcast i8* %t108 to i8* (i8*)*
  %t111 = call i8* %t110(i8* %t109)
  br label %match.merge.9
match.default.8:
  br label %match.merge.9
match.merge.9:
  %t112 = phi i8* [ %t111, %match.arm0.10 ], [ null, %match.default.8 ]
  ret i8* %t112
}

define void @fallThroughDemo(double %arg.code) {
entry:
  %code.addr = alloca double, align 8
  store double %arg.code, double* %code.addr, align 8
  %t113 = load double, double* %code.addr, align 8
  br label %switch.cond.12
switch.cond.12:
  %t114 = fcmp oeq double %t113, 1.0
  br i1 %t114, label %switch.body0.13, label %switch.case_next1.14
switch.body0.13:
  %t115 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.2, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t115)
  br label %switch.merge.11
switch.case_next1.14:
  %t116 = fcmp oeq double %t113, 2.0
  br i1 %t116, label %switch.body1.15, label %switch.case_next2.16
switch.body1.15:
  %t117 = getelementptr inbounds [15 x i8], [15 x i8]* @.str.3, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t117)
  br label %switch.merge.11
switch.case_next2.16:
  %t118 = getelementptr inbounds [16 x i8], [16 x i8]* @.str.4, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t118)
  br label %switch.merge.11
switch.merge.11:
  %t119 = phi double [ 0.0, %switch.body0.13 ]
  ret void
}

define i8* @describe(%struct.GADTValue* %arg.shape) {
entry:
  %shape.addr = alloca %struct.GADTValue*, align 8
  %t130 = alloca i8*, align 8
  %t137 = alloca i8*, align 8
  %t141 = alloca i8*, align 8
  store %struct.GADTValue* %arg.shape, %struct.GADTValue** %shape.addr, align 8
  %t120 = load %struct.GADTValue*, %struct.GADTValue** %shape.addr, align 8
  %t122 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t120, i32 0, i32 0
  %t121 = load i32, i32* %t122, align 4
  switch i32 %t121, label %match.default.17 [ i32 0, label %match.arm0.19 i32 1, label %match.arm2.21 i32 2, label %match.arm4.23 i32 5, label %match.arm5.24 ]
match.arm0.19:
  %t123 = fcmp ogt double 0.0, 10.0
  br i1 %t123, label %match.guard_pass0.25, label %match.arm1.20
match.guard_pass0.25:
  %t124 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.5, i64 0, i64 0
  br label %match.merge.18
match.arm1.20:
  %t125 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t120, i32 0, i32 1
  %t126 = load i8*, i8** %t125, align 8
  %t127 = getelementptr inbounds i8, i8* %t126, i64 0
  %t128 = bitcast i8* %t127 to i8**
  %t129 = load i8*, i8** %t128, align 8
  store i8* %t129, i8** %t130, align 8
  %t131 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.6, i64 0, i64 0
  br label %match.merge.18
match.arm2.21:
  %t132 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t120, i32 0, i32 1
  %t133 = load i8*, i8** %t132, align 8
  %t134 = getelementptr inbounds i8, i8* %t133, i64 0
  %t135 = bitcast i8* %t134 to i8**
  %t136 = load i8*, i8** %t135, align 8
  store i8* %t136, i8** %t137, align 8
  %t138 = getelementptr inbounds i8, i8* %t133, i64 8
  %t139 = bitcast i8* %t138 to i8**
  %t140 = load i8*, i8** %t139, align 8
  store i8* %t140, i8** %t141, align 8
  %t142 = load i8*, i8** %t137, align 8
  %t143 = load i8*, i8** %t141, align 8
  %t144 = icmp eq i8* %t142, %t143
  br i1 %t144, label %match.guard_pass2.26, label %match.arm3.22
match.guard_pass2.26:
  %t145 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.7, i64 0, i64 0
  br label %match.merge.18
match.arm3.22:
  %t146 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t120, i32 0, i32 1
  %t147 = load i8*, i8** %t146, align 8
  %t148 = getelementptr inbounds [10 x i8], [10 x i8]* @.str.8, i64 0, i64 0
  br label %match.merge.18
match.arm4.23:
  %t149 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.9, i64 0, i64 0
  br label %match.merge.18
match.arm5.24:
  %t150 = getelementptr inbounds [12 x i8], [12 x i8]* @.str.10, i64 0, i64 0
  br label %match.merge.18
match.default.17:
  br label %match.merge.18
match.merge.18:
  %t151 = phi i8* [ %t124, %match.guard_pass0.25 ], [ %t131, %match.arm1.20 ], [ %t145, %match.guard_pass2.26 ], [ %t148, %match.arm3.22 ], [ %t149, %match.arm4.23 ], [ %t150, %match.arm5.24 ], [ null, %match.default.17 ]
  ret i8* %t151
}

define i8* @describePair(i8* %arg.value) {
entry:
  %value.addr = alloca i8*, align 8
  store i8* %arg.value, i8** %value.addr, align 8
  %t152 = load i8*, i8** %value.addr, align 8
  %t153 = bitcast i8* %t152 to %struct.GADTValue*
  %t155 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t153, i32 0, i32 0
  %t154 = load i32, i32* %t155, align 4
  switch i32 %t154, label %match.default.27 [ i32 0, label %match.arm0.29 ]
match.arm0.29:
  %t156 = call i8* @malloc(i64 64)
  %t157 = call i32 (i8*, i8*, ...) @sprintf(i8* %t156, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t158 = call i8* @malloc(i64 64)
  %t159 = call i32 (i8*, i8*, ...) @sprintf(i8* %t158, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t160 = call i64 @strlen(i8* %t158)
  %t161 = call i64 @strlen(i8* %t156)
  %t162 = add i64 %t160, %t161
  %t163 = add i64 %t162, 1
  %t164 = call i8* @malloc(i64 %t163)
  %t165 = call i8* @strcpy(i8* %t164, i8* %t158)
  %t166 = call i8* @strcat(i8* %t164, i8* %t156)
  br label %match.merge.28
match.default.27:
  br label %match.merge.28
match.merge.28:
  %t167 = phi i8* [ %t164, %match.arm0.29 ], [ null, %match.default.27 ]
  ret i8* %t167
}

define i8* @readRecord(i8* %arg.value) {
entry:
  %value.addr = alloca i8*, align 8
  %t174 = alloca i8*, align 8
  %t177 = alloca i8*, align 8
  store i8* %arg.value, i8** %value.addr, align 8
  %t168 = load i8*, i8** %value.addr, align 8
  %t169 = bitcast i8* %t168 to %struct.GADTValue*
  %t171 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t169, i32 0, i32 0
  %t170 = load i32, i32* %t171, align 4
  switch i32 %t170, label %match.default.30 [ i32 0, label %match.arm0.32 ]
match.arm0.32:
  %t172 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.11, i64 0, i64 0
  %t173 = call i8* @_tl_record_get(i8* %t168, i8* %t172)
  store i8* %t173, i8** %t174, align 8
  %t175 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t176 = call i8* @_tl_record_get(i8* %t168, i8* %t175)
  store i8* %t176, i8** %t177, align 8
  %t178 = call i8* @malloc(i64 64)
  %t179 = call i32 (i8*, i8*, ...) @sprintf(i8* %t178, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t180 = call i8* @malloc(i64 64)
  %t181 = call i32 (i8*, i8*, ...) @sprintf(i8* %t180, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t182 = call i64 @strlen(i8* %t180)
  %t183 = call i64 @strlen(i8* %t178)
  %t184 = add i64 %t182, %t183
  %t185 = add i64 %t184, 1
  %t186 = call i8* @malloc(i64 %t185)
  %t187 = call i8* @strcpy(i8* %t186, i8* %t180)
  %t188 = call i8* @strcat(i8* %t186, i8* %t178)
  br label %match.merge.31
match.default.30:
  br label %match.merge.31
match.merge.31:
  %t189 = phi i8* [ %t186, %match.arm0.32 ], [ null, %match.default.30 ]
  ret i8* %t189
}

define i8* @literalMatch(double %arg.value) {
entry:
  %value.addr = alloca double, align 8
  store double %arg.value, double* %value.addr, align 8
  %t190 = load double, double* %value.addr, align 8
  switch i32 0, label %match.arm2.37 [ i32 0, label %match.arm0.35 i32 1, label %match.arm1.36 ]
match.arm0.35:
  %t192 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.13, i64 0, i64 0
  br label %match.merge.34
match.arm1.36:
  %t193 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.14, i64 0, i64 0
  br label %match.merge.34
match.arm2.37:
  %t194 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.15, i64 0, i64 0
  %t195 = call i8* @malloc(i64 64)
  %t196 = call i32 (i8*, i8*, ...) @sprintf(i8* %t195, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t197 = call i64 @strlen(i8* %t194)
  %t198 = call i64 @strlen(i8* %t195)
  %t199 = add i64 %t197, %t198
  %t200 = add i64 %t199, 1
  %t201 = call i8* @malloc(i64 %t200)
  %t202 = call i8* @strcpy(i8* %t201, i8* %t194)
  %t203 = call i8* @strcat(i8* %t201, i8* %t195)
  br label %match.merge.34
match.merge.34:
  %t204 = phi i8* [ %t192, %match.arm0.35 ], [ %t193, %match.arm1.36 ], [ %t201, %match.arm2.37 ]
  ret i8* %t204
}

define %struct.GADTValue* @lookup(%struct.GADTValue* %arg.id) {
entry:
  %id.addr = alloca %struct.GADTValue*, align 8
  store %struct.GADTValue* %arg.id, %struct.GADTValue** %id.addr, align 8
  %t205 = load %struct.GADTValue*, %struct.GADTValue** %id.addr, align 8
  %t208 = bitcast %struct.GADTValue* %t205 to i8*
  %t209 = ptrtoint i8* %t208 to i64
  %t207 = bitcast i64 %t209 to double
  %t206 = fcmp oeq double %t207, 1.0
  br i1 %t206, label %then.38, label %else.39
then.38:
  %t210 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.16, i64 0, i64 0
  %t211 = call i8* @malloc(i64 16)
  %t212 = bitcast i8* %t211 to %struct.GADTValue*
  %t213 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t212, i32 0, i32 0
  store i32 0, i32* %t213, align 4
  %t214 = call i8* @malloc(i64 8)
  %t215 = getelementptr inbounds i8, i8* %t214, i64 0
  %t216 = bitcast i8* %t215 to i8**
  store i8* %t210, i8** %t216, align 8
  %t217 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t212, i32 0, i32 1
  store i8* %t214, i8** %t217, align 8
  br label %if.merge.40
else.39:
  %t218 = call i8* @malloc(i64 16)
  %t219 = bitcast i8* %t218 to %struct.GADTValue*
  %t220 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t219, i32 0, i32 0
  store i32 1, i32* %t220, align 4
  %t221 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t219, i32 0, i32 1
  store i8* null, i8** %t221, align 8
  br label %if.merge.40
if.merge.40:
  %t222 = phi %struct.GADTValue* [ %t212, %then.38 ], [ %t219, %else.39 ]
  ret %struct.GADTValue* %t222
}

define i8* @report(double %arg.value) {
entry:
  %value.addr = alloca double, align 8
  store double %arg.value, double* %value.addr, align 8
  %t223 = load double, double* %value.addr, align 8
  %t224 = call i8* @render(double %t223)
  ret i8* %t224
}

define i8* @render(double %arg.n) {
entry:
  %n.addr = alloca double, align 8
  store double %arg.n, double* %n.addr, align 8
  %t225 = getelementptr inbounds [7 x i8], [7 x i8]* @.str.17, i64 0, i64 0
  %t226 = load double, double* %n.addr, align 8
  %t227 = call i8* @malloc(i64 64)
  %t228 = call i32 (i8*, i8*, ...) @sprintf(i8* %t227, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t226)
  %t229 = call i64 @strlen(i8* %t225)
  %t230 = call i64 @strlen(i8* %t227)
  %t231 = add i64 %t229, %t230
  %t232 = add i64 %t231, 1
  %t233 = call i8* @malloc(i64 %t232)
  %t234 = call i8* @strcpy(i8* %t233, i8* %t225)
  %t235 = call i8* @strcat(i8* %t233, i8* %t227)
  ret i8* %t233
}

define i32 @main() {
entry:
  %shortLambda.var = alloca i8*, align 8
  %typedUser.var = alloca i8*, align 8
  %name.var = alloca i8*, align 8
  %shorthandRecord.var = alloca i8*, align 8
  %user.var = alloca i8*, align 8
  %revisedUser.var = alloca i8*, align 8
  %pair.var = alloca %struct.GADTValue*, align 8
  %numbers.var = alloca %struct.Array*, align 8
  %first.var = alloca i8*, align 8
  %oddsSquared.var = alloca %struct.Array*, align 8
  %exclusiveRange.var = alloca %struct.Array*, align 8
  %total.var = alloca double, align 8
  %counter.var = alloca double, align 8
  %logical.var = alloca i1, align 8
  %label.var = alloca i8*, align 8
  %base.var = alloca double, align 8
  %blockValue.var = alloca double, align 8
  %thenValue.var = alloca i8*, align 8
  %loopTotal.var = alloca double, align 8
  %i.var = alloca double, align 8
  %countdown.var = alloca double, align 8
  %dayKind.var = alloca i8*, align 8
  %selectedText.var = alloca double, align 8
  %clipped.var = alloca double, align 8
  %maybe.var = alloca double, align 8
  %maybeText.var = alloca double, align 8
  %computation.var = alloca i8*, align 8
  %returnedComputation.var = alloca i8*, align 8
  %left.var = alloca double, align 8
  %right.var = alloca double, align 8
  %scopedResult.var = alloca double, align 8
  %escapedText.var = alloca i8*, align 8
  %rankResults.var = alloca i8*, align 8
  ; GADT Sum Type Definition: Badge
  ;   Constructor [0]: Star(level)
  ;   Constructor [1]: Plain()
  ; GADT Sum Type Definition: OptionBox
  ;   Constructor [0]: Box(value)
  ;   Constructor [1]: Empty()
  ; GADT Sum Type Definition: Term
  ;   Constructor [0]: NumberTerm(value)
  ;   Constructor [1]: SumTerm(left, right)
  %t243 = bitcast i8* (i8*)* @.lambda_1 to i8*
  store i8* %t243, i8** %shortLambda.var, align 8
  store i8* %t243, i8** @shortLambda, align 8
  ; GADT Sum Type Definition: Packed
  ;   Constructor [0]: Pack(value, show)
  %t244 = call i8* @malloc(i64 56)
  %t245 = bitcast i8* %t244 to i64*
  store i64 3, i64* %t245, align 8
  %t246 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.11, i64 0, i64 0
  %t247 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.18, i64 0, i64 0
  %t248 = getelementptr inbounds i8, i8* %t244, i64 8
  %t249 = bitcast i8* %t248 to i8**
  store i8* %t246, i8** %t249, align 8
  %t250 = getelementptr inbounds i8, i8* %t244, i64 16
  %t251 = bitcast i8* %t250 to i8**
  store i8* %t247, i8** %t251, align 8
  %t252 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t253 = fadd double 36.0, 0.0
  %t254 = bitcast double %t253 to i64
  %t255 = inttoptr i64 %t254 to i8*
  %t256 = getelementptr inbounds i8, i8* %t244, i64 24
  %t257 = bitcast i8* %t256 to i8**
  store i8* %t252, i8** %t257, align 8
  %t258 = getelementptr inbounds i8, i8* %t244, i64 32
  %t259 = bitcast i8* %t258 to i8**
  store i8* %t255, i8** %t259, align 8
  %t260 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.19, i64 0, i64 0
  %t261 = fadd double 10.0, 0.0
  %t262 = bitcast double %t261 to i64
  %t263 = inttoptr i64 %t262 to i8*
  %t264 = getelementptr inbounds i8, i8* %t244, i64 40
  %t265 = bitcast i8* %t264 to i8**
  store i8* %t260, i8** %t265, align 8
  %t266 = getelementptr inbounds i8, i8* %t244, i64 48
  %t267 = bitcast i8* %t266 to i8**
  store i8* %t263, i8** %t267, align 8
  store i8* %t244, i8** %typedUser.var, align 8
  %t268 = bitcast i8* %t244 to %struct.GADTValue*
  store %struct.GADTValue* %t268, %struct.GADTValue** @typedUser, align 8
  %t269 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.18, i64 0, i64 0
  store i8* %t269, i8** %name.var, align 8
  store i8* %t269, i8** @name, align 8
  %t270 = load i8*, i8** %name.var, align 8
  store i8* %t270, i8** %shorthandRecord.var, align 8
  store i8* %t270, i8** @shorthandRecord, align 8
  %t271 = call i8* @malloc(i64 56)
  %t272 = bitcast i8* %t271 to i64*
  store i64 3, i64* %t272, align 8
  %t273 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.11, i64 0, i64 0
  %t274 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.18, i64 0, i64 0
  %t275 = getelementptr inbounds i8, i8* %t271, i64 8
  %t276 = bitcast i8* %t275 to i8**
  store i8* %t273, i8** %t276, align 8
  %t277 = getelementptr inbounds i8, i8* %t271, i64 16
  %t278 = bitcast i8* %t277 to i8**
  store i8* %t274, i8** %t278, align 8
  %t279 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t280 = fadd double 36.0, 0.0
  %t281 = bitcast double %t280 to i64
  %t282 = inttoptr i64 %t281 to i8*
  %t283 = getelementptr inbounds i8, i8* %t271, i64 24
  %t284 = bitcast i8* %t283 to i8**
  store i8* %t279, i8** %t284, align 8
  %t285 = getelementptr inbounds i8, i8* %t271, i64 32
  %t286 = bitcast i8* %t285 to i8**
  store i8* %t282, i8** %t286, align 8
  %t287 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.19, i64 0, i64 0
  %t288 = fadd double 10.0, 0.0
  %t289 = bitcast double %t288 to i64
  %t290 = inttoptr i64 %t289 to i8*
  %t291 = getelementptr inbounds i8, i8* %t271, i64 40
  %t292 = bitcast i8* %t291 to i8**
  store i8* %t287, i8** %t292, align 8
  %t293 = getelementptr inbounds i8, i8* %t271, i64 48
  %t294 = bitcast i8* %t293 to i8**
  store i8* %t290, i8** %t294, align 8
  store i8* %t271, i8** %user.var, align 8
  store i8* %t271, i8** @user, align 8
  %t295 = call i8* @malloc(i64 88)
  %t296 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t297 = load i8*, i8** %user.var, align 8
  %t298 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t299 = call i8* @_tl_record_get(i8* %t297, i8* %t298)
  %t302 = ptrtoint i8* %t299 to i64
  %t301 = bitcast i64 %t302 to double
  %t300 = fadd double %t301, 1.0
  %t303 = bitcast double %t300 to i64
  %t304 = inttoptr i64 %t303 to i8*
  %t305 = getelementptr inbounds i8, i8* %t295, i64 8
  %t306 = bitcast i8* %t305 to i8**
  store i8* %t296, i8** %t306, align 8
  %t307 = getelementptr inbounds i8, i8* %t295, i64 16
  %t308 = bitcast i8* %t307 to i8**
  store i8* %t304, i8** %t308, align 8
  store i8* %t295, i8** %revisedUser.var, align 8
  store i8* %t295, i8** @revisedUser, align 8
  %t309 = fadd double 3.0, 0.0
  %t310 = bitcast double %t309 to i64
  %t311 = inttoptr i64 %t310 to i8*
  %t312 = bitcast i8* %t311 to %struct.GADTValue*
  %t313 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.20, i64 0, i64 0
  %t314 = bitcast i8* %t313 to %struct.GADTValue*
  %t315 = call %struct.GADTValue* @makePair(%struct.GADTValue* %t312, %struct.GADTValue* %t314)
  store %struct.GADTValue* %t315, %struct.GADTValue** %pair.var, align 8
  %t316 = bitcast %struct.GADTValue* %t315 to i8*
  store i8* %t316, i8** @pair, align 8
  %t317 = call i8* @malloc(i64 16)
  %t318 = bitcast i8* %t317 to %struct.Array*
  %t319 = getelementptr inbounds %struct.Array, %struct.Array* %t318, i32 0, i32 0
  store i64 5, i64* %t319, align 8
  %t320 = call i8* @malloc(i64 40)
  %t321 = fadd double 1.0, 0.0
  %t322 = bitcast double %t321 to i64
  %t323 = inttoptr i64 %t322 to i8*
  %t324 = getelementptr inbounds i8, i8* %t320, i64 0
  %t325 = bitcast i8* %t324 to i8**
  store i8* %t323, i8** %t325, align 8
  %t326 = fadd double 2.0, 0.0
  %t327 = bitcast double %t326 to i64
  %t328 = inttoptr i64 %t327 to i8*
  %t329 = getelementptr inbounds i8, i8* %t320, i64 8
  %t330 = bitcast i8* %t329 to i8**
  store i8* %t328, i8** %t330, align 8
  %t331 = fadd double 3.0, 0.0
  %t332 = bitcast double %t331 to i64
  %t333 = inttoptr i64 %t332 to i8*
  %t334 = getelementptr inbounds i8, i8* %t320, i64 16
  %t335 = bitcast i8* %t334 to i8**
  store i8* %t333, i8** %t335, align 8
  %t336 = fadd double 4.0, 0.0
  %t337 = bitcast double %t336 to i64
  %t338 = inttoptr i64 %t337 to i8*
  %t339 = getelementptr inbounds i8, i8* %t320, i64 24
  %t340 = bitcast i8* %t339 to i8**
  store i8* %t338, i8** %t340, align 8
  %t341 = fadd double 5.0, 0.0
  %t342 = bitcast double %t341 to i64
  %t343 = inttoptr i64 %t342 to i8*
  %t344 = getelementptr inbounds i8, i8* %t320, i64 32
  %t345 = bitcast i8* %t344 to i8**
  store i8* %t343, i8** %t345, align 8
  %t346 = getelementptr inbounds %struct.Array, %struct.Array* %t318, i32 0, i32 1
  %t347 = bitcast i8* %t320 to i8**
  store i8** %t347, i8*** %t346, align 8
  store %struct.Array* %t318, %struct.Array** %numbers.var, align 8
  store %struct.Array* %t318, %struct.Array** @numbers, align 8
  %t348 = load %struct.Array*, %struct.Array** %numbers.var, align 8
  %t349 = fptosi double 0.0 to i64
  %t350 = getelementptr inbounds %struct.Array, %struct.Array* %t348, i32 0, i32 1
  %t351 = load i8**, i8*** %t350, align 8
  %t352 = getelementptr inbounds i8*, i8** %t351, i64 %t349
  %t353 = load i8*, i8** %t352, align 8
  store i8* %t353, i8** %first.var, align 8
  store i8* %t353, i8** @first, align 8
  store %struct.Array* null, %struct.Array** %oddsSquared.var, align 8
  store i8* null, i8** @oddsSquared, align 8
  %t354 = fptosi double 2.0 to i64
  %t355 = fptosi double 5.0 to i64
  %t356 = icmp sle i64 %t354, %t355
  %t357 = sub i64 %t355, 1
  %t358 = add i64 %t355, 1
  %t359 = select i1 %t356, i64 %t357, i64 %t358
  %t360 = sub i64 %t359, %t354
  %t361 = add i64 %t360, 1
  %t362 = icmp sge i64 %t359, %t354
  %t363 = select i1 %t362, i64 %t361, i64 0
  %t364 = sub i64 %t354, %t359
  %t365 = add i64 %t364, 1
  %t366 = icmp sle i64 %t359, %t354
  %t367 = select i1 %t366, i64 %t365, i64 0
  %t368 = select i1 %t356, i64 %t363, i64 %t367
  %t369 = call i8* @malloc(i64 16)
  %t370 = bitcast i8* %t369 to %struct.Array*
  %t371 = getelementptr inbounds %struct.Array, %struct.Array* %t370, i32 0, i32 0
  store i64 %t368, i64* %t371, align 8
  %t372 = mul i64 %t368, 8
  %t374 = icmp eq i64 %t372, 0
  %t373 = select i1 %t374, i64 16, i64 %t372
  %t375 = call i8* @malloc(i64 %t373)
  %t376 = getelementptr inbounds %struct.Array, %struct.Array* %t370, i32 0, i32 1
  %t377 = bitcast i8* %t375 to i8**
  store i8** %t377, i8*** %t376, align 8
  store %struct.Array* %t370, %struct.Array** %exclusiveRange.var, align 8
  %t378 = bitcast %struct.Array* %t370 to i8*
  store i8* %t378, i8** @exclusiveRange, align 8
  store double 0.0, double* %total.var, align 8
  %t379 = fadd double 0.0, 0.0
  %t380 = bitcast double %t379 to i64
  %t381 = inttoptr i64 %t380 to i8*
  store i8* %t381, i8** @total, align 8
  store double 0.0, double* %counter.var, align 8
  store double 0.0, double* @counter, align 8
  %t382 = load double, double* %counter.var, align 8
  %t383 = fadd double %t382, 1.0
  store double %t383, double* %counter.var, align 8
  %t384 = load double, double* %counter.var, align 8
  %t385 = fadd double %t384, 2.0
  store double %t385, double* %counter.var, align 8
  %t386 = load double, double* %counter.var, align 8
  %t387 = fsub double %t386, 1.0
  store double %t387, double* %counter.var, align 8
  %t388 = load double, double* %counter.var, align 8
  %t389 = fmul double %t388, 3.0
  store double %t389, double* %counter.var, align 8
  %t390 = load double, double* %counter.var, align 8
  %t391 = fdiv double %t390, 2.0
  store double %t391, double* %counter.var, align 8
  %t392 = load double, double* %counter.var, align 8
  %t393 = fcmp ogt double %t392, 0.0
  %t394 = load double, double* %counter.var, align 8
  %t395 = fcmp oeq double %t394, 99.0
  %t396 = xor i1 %t395, 1
  %t397 = and i1 %t393, %t396
  %t398 = or i1 %t397, 0
  store i1 %t398, i1* %logical.var, align 8
  %t399 = zext i1 %t398 to i64
  %t400 = inttoptr i64 %t399 to i8*
  store i8* %t400, i8** @logical, align 8
  %t401 = load i1, i1* %logical.var, align 8
  br i1 %t401, label %then.41, label %else.42
then.41:
  %t402 = getelementptr inbounds [6 x i8], [6 x i8]* @.str.21, i64 0, i64 0
  br label %if.merge.43
else.42:
  %t403 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.22, i64 0, i64 0
  br label %if.merge.43
if.merge.43:
  %t404 = phi i8* [ %t402, %then.41 ], [ %t403, %else.42 ]
  store i8* %t404, i8** %label.var, align 8
  store i8* %t404, i8** @label, align 8
  store double 4.0, double* %base.var, align 8
  %t405 = load double, double* %base.var, align 8
  %t406 = load double, double* %base.var, align 8
  %t407 = fmul double %t405, %t406
  store double %t407, double* %blockValue.var, align 8
  %t408 = bitcast double %t407 to i64
  %t409 = inttoptr i64 %t408 to i8*
  store i8* %t409, i8** @blockValue, align 8
  %t410 = load double, double* %counter.var, align 8
  %t411 = fcmp ogt double %t410, 0.0
  br i1 %t411, label %then.44, label %else.45
then.44:
  %t412 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.23, i64 0, i64 0
  br label %if.merge.46
else.45:
  %t413 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.13, i64 0, i64 0
  br label %if.merge.46
if.merge.46:
  %t414 = phi i8* [ %t412, %then.44 ], [ %t413, %else.45 ]
  store i8* %t414, i8** %thenValue.var, align 8
  store i8* %t414, i8** @thenValue, align 8
  %t415 = load double, double* %counter.var, align 8
  %t416 = fcmp oge double %t415, 1.0
  br i1 %t416, label %then.47, label %else.48
then.47:
  %t417 = load double, double* %counter.var, align 8
  %t418 = fadd double %t417, 1.0
  store double %t418, double* %counter.var, align 8
  br label %if.merge.49
else.48:
  %t419 = load double, double* %counter.var, align 8
  %t420 = fcmp oeq double %t419, 0.0
  br i1 %t420, label %then.50, label %else.51
then.50:
  store double 1.0, double* %counter.var, align 8
  br label %if.merge.52
else.51:
  store double 2.0, double* %counter.var, align 8
  br label %if.merge.52
if.merge.52:
  %t421 = phi double [ 1.0, %then.50 ], [ 2.0, %else.51 ]
  br label %if.merge.49
if.merge.49:
  %t422 = phi double [ %t418, %then.47 ], [ %t421, %if.merge.52 ]
  store double 0.0, double* %loopTotal.var, align 8
  %t423 = fadd double 0.0, 0.0
  %t424 = bitcast double %t423 to i64
  %t425 = inttoptr i64 %t424 to i8*
  store i8* %t425, i8** @loopTotal, align 8
  store double 0.0, double* %i.var, align 8
  br label %for.cond.53
for.cond.53:
  %t426 = load double, double* %i.var, align 8
  %t427 = fcmp olt double %t426, 6.0
  br i1 %t427, label %for.body.54, label %for.merge.55
for.body.54:
  %t428 = load double, double* %i.var, align 8
  %t429 = fcmp oeq double %t428, 1.0
  br i1 %t429, label %then.56, label %else.57
then.56:
  br label %if.merge.58
else.57:
  br label %if.merge.58
if.merge.58:
  %t430 = load double, double* %i.var, align 8
  %t431 = fcmp oeq double %t430, 5.0
  br i1 %t431, label %then.59, label %else.60
then.59:
  br label %if.merge.61
else.60:
  br label %if.merge.61
if.merge.61:
  %t432 = load double, double* %i.var, align 8
  %t433 = load double, double* %loopTotal.var, align 8
  %t434 = fadd double %t433, %t432
  store double %t434, double* %loopTotal.var, align 8
  %t435 = load double, double* %i.var, align 8
  %t436 = fadd double %t435, 1.0
  store double %t436, double* %i.var, align 8
  br label %for.cond.53
for.merge.55:
  store double 2.0, double* %countdown.var, align 8
  %t437 = fadd double 2.0, 0.0
  %t438 = bitcast double %t437 to i64
  %t439 = inttoptr i64 %t438 to i8*
  store i8* %t439, i8** @countdown, align 8
  br label %while.cond.62
while.cond.62:
  %t440 = load double, double* %countdown.var, align 8
  %t441 = fcmp ogt double %t440, 0.0
  br i1 %t441, label %while.body.63, label %while.merge.64
while.body.63:
  %t442 = load double, double* %countdown.var, align 8
  %t443 = fsub double %t442, 1.0
  store double %t443, double* %countdown.var, align 8
  br label %while.cond.62
while.merge.64:
  br label %switch.cond.66
switch.cond.66:
  %t444 = fcmp oeq double 5.0, 1.0
  br i1 %t444, label %switch.body0.67, label %switch.or0_1.69
switch.or0_1.69:
  %t445 = fcmp oeq double 5.0, 2.0
  br i1 %t445, label %switch.body0.67, label %switch.or0_2.70
switch.or0_2.70:
  %t446 = fcmp oeq double 5.0, 3.0
  br i1 %t446, label %switch.body0.67, label %switch.or0_3.71
switch.or0_3.71:
  %t447 = fcmp oeq double 5.0, 4.0
  br i1 %t447, label %switch.body0.67, label %switch.or0_4.72
switch.or0_4.72:
  %t448 = fcmp oeq double 5.0, 5.0
  br i1 %t448, label %switch.body0.67, label %switch.case_next1.68
switch.body0.67:
  %t449 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.24, i64 0, i64 0
  br label %switch.merge.65
switch.case_next1.68:
  %t450 = fcmp oeq double 5.0, 6.0
  br i1 %t450, label %switch.body1.73, label %switch.or1_1.75
switch.or1_1.75:
  %t451 = fcmp oeq double 5.0, 7.0
  br i1 %t451, label %switch.body1.73, label %switch.case_next2.74
switch.body1.73:
  %t452 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.25, i64 0, i64 0
  br label %switch.merge.65
switch.case_next2.74:
  %t453 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.26, i64 0, i64 0
  br label %switch.merge.65
switch.merge.65:
  %t454 = phi i8* [ %t449, %switch.body0.67 ], [ %t452, %switch.body1.73 ], [ %t453, %switch.case_next2.74 ]
  store i8* %t454, i8** %dayKind.var, align 8
  store i8* %t454, i8** @dayKind, align 8
  ; GADT Sum Type Definition: Shape
  ;   Constructor [0]: Circle(radius)
  ;   Constructor [1]: Rectangle(width, height)
  ;   Constructor [2]: Dot()
  store double 0.0, double* %selectedText.var, align 8
  %t455 = fadd double 0.0, 0.0
  %t456 = bitcast double %t455 to i64
  %t457 = inttoptr i64 %t456 to i8*
  store i8* %t457, i8** @selectedText, align 8
  %t458 = load %struct.Array*, %struct.Array** %numbers.var, align 8
  %t459 = fptosi double 4.0 to i64
  %t460 = getelementptr inbounds %struct.Array, %struct.Array* %t458, i32 0, i32 1
  %t461 = load i8**, i8*** %t460, align 8
  %t462 = getelementptr inbounds i8*, i8** %t461, i64 %t459
  %t463 = load i8*, i8** %t462, align 8
  %t464 = load %struct.Array*, %struct.Array** %numbers.var, align 8
  %t465 = fptosi double 4.0 to i64
  %t466 = getelementptr inbounds %struct.Array, %struct.Array* %t464, i32 0, i32 1
  %t467 = load i8**, i8*** %t466, align 8
  %t468 = getelementptr inbounds i8*, i8** %t467, i64 %t465
  %t469 = load i8*, i8** %t468, align 8
  %t470 = call double @Math_min(double 10.0, i8* %t469)
  store double %t470, double* %clipped.var, align 8
  %t471 = bitcast double %t470 to i64
  %t472 = inttoptr i64 %t471 to i8*
  store i8* %t472, i8** @clipped, align 8
  %t473 = call double @Option_Some(double 42.0)
  store double %t473, double* %maybe.var, align 8
  %t474 = bitcast double %t473 to i64
  %t475 = inttoptr i64 %t474 to i8*
  %t476 = bitcast i8* %t475 to %struct.GADTValue*
  store %struct.GADTValue* %t476, %struct.GADTValue** @maybe, align 8
  %t477 = load double, double* %maybe.var, align 8
  %t484 = bitcast i8* (i8*)* @.lambda_2 to i8*
  %t485 = load double, double* %maybe.var, align 8
  %t492 = bitcast i8* (i8*)* @.lambda_3 to i8*
  %t493 = call double @Option_map(double %t485, i8* %t492)
  store double %t493, double* %maybeText.var, align 8
  %t494 = bitcast double %t493 to i64
  %t495 = inttoptr i64 %t494 to i8*
  store i8* %t495, i8** @maybeText, align 8
  %t496 = fadd double 0.0, 0.0
  %t497 = bitcast double %t496 to i64
  %t498 = inttoptr i64 %t497 to i8*
  %t499 = getelementptr inbounds [8 x i8], [8 x i8]* @.str.27, i64 0, i64 0
  %t500 = call i8* @_tl_record_get(i8* %t498, i8* %t499)
  %t501 = load double, double* %maybe.var, align 8
  %t518 = bitcast i8* (i8*)* @.lambda_4 to i8*
  %t519 = bitcast i8* %t500 to i8* (i8*, i8*)*
  %t520 = bitcast double %t501 to i64
  %t521 = inttoptr i64 %t520 to i8*
  %t522 = call i8* %t519(i8* %t521, i8* %t518)
  store i8* %t522, i8** %computation.var, align 8
  store i8* %t522, i8** @computation, align 8
  %t523 = fadd double 0.0, 0.0
  %t524 = bitcast double %t523 to i64
  %t525 = inttoptr i64 %t524 to i8*
  %t526 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.28, i64 0, i64 0
  %t527 = call i8* @_tl_record_get(i8* %t525, i8* %t526)
  %t528 = call double @Option_Some(double 7.0)
  %t529 = bitcast i8* %t527 to i8* (i8*)*
  %t530 = bitcast double %t528 to i64
  %t531 = inttoptr i64 %t530 to i8*
  %t532 = call i8* %t529(i8* %t531)
  store i8* %t532, i8** %returnedComputation.var, align 8
  store i8* %t532, i8** @returnedComputation, align 8
  store double 20.0, double* %left.var, align 8
  store double 22.0, double* %right.var, align 8
  %t533 = load double, double* %left.var, align 8
  %t534 = load double, double* %right.var, align 8
  %t535 = fadd double %t533, %t534
  store double %t535, double* %scopedResult.var, align 8
  %t536 = bitcast double %t535 to i64
  %t537 = inttoptr i64 %t536 to i8*
  store i8* %t537, i8** @scopedResult, align 8
  %t538 = getelementptr inbounds [39 x i8], [39 x i8]* @.str.29, i64 0, i64 0
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t538)
  %t539 = getelementptr inbounds [19 x i8], [19 x i8]* @.str.30, i64 0, i64 0
  store i8* %t539, i8** %escapedText.var, align 8
  store i8* %t539, i8** @escapedText, align 8
  %t540 = getelementptr inbounds [25 x i8], [25 x i8]* @.str.31, i64 0, i64 0
  %t541 = call double @squareFromKit(double 6.0)
  %t542 = call i8* @malloc(i64 64)
  %t543 = call i32 (i8*, i8*, ...) @sprintf(i8* %t542, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t541)
  %t544 = call i64 @strlen(i8* %t540)
  %t545 = call i64 @strlen(i8* %t542)
  %t546 = add i64 %t544, %t545
  %t547 = add i64 %t546, 1
  %t548 = call i8* @malloc(i64 %t547)
  %t549 = call i8* @strcpy(i8* %t548, i8* %t540)
  %t550 = call i8* @strcat(i8* %t548, i8* %t542)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t548)
  %t551 = getelementptr inbounds [23 x i8], [23 x i8]* @.str.32, i64 0, i64 0
  %t552 = load double, double* %blockValue.var, align 8
  %t553 = load double, double* %blockValue.var, align 8
  %t554 = call double @UK_square(double %t553)
  %t555 = call i8* @malloc(i64 64)
  %t556 = call i32 (i8*, i8*, ...) @sprintf(i8* %t555, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t554)
  %t557 = call i64 @strlen(i8* %t551)
  %t558 = call i64 @strlen(i8* %t555)
  %t559 = add i64 %t557, %t558
  %t560 = add i64 %t559, 1
  %t561 = call i8* @malloc(i64 %t560)
  %t562 = call i8* @strcpy(i8* %t561, i8* %t551)
  %t563 = call i8* @strcat(i8* %t561, i8* %t555)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t561)
  %t564 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.33, i64 0, i64 0
  %t565 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.33, i64 0, i64 0
  %t566 = call double @greet(i8* %t565)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t566)
  %t567 = getelementptr inbounds [23 x i8], [23 x i8]* @.str.34, i64 0, i64 0
  %t568 = load i8*, i8** %revisedUser.var, align 8
  %t569 = getelementptr inbounds [4 x i8], [4 x i8]* @.str.12, i64 0, i64 0
  %t570 = call i8* @_tl_record_get(i8* %t568, i8* %t569)
  %t571 = call i8* @malloc(i64 64)
  %t572 = call i32 (i8*, i8*, ...) @sprintf(i8* %t571, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double 0.0)
  %t573 = call i64 @strlen(i8* %t571)
  %t574 = call i64 @strlen(i8* %t570)
  %t575 = add i64 %t573, %t574
  %t576 = add i64 %t575, 1
  %t577 = call i8* @malloc(i64 %t576)
  %t578 = call i8* @strcpy(i8* %t577, i8* %t571)
  %t579 = call i8* @strcat(i8* %t577, i8* %t570)
  %t580 = call i64 @strlen(i8* %t567)
  %t581 = call i64 @strlen(i8* %t577)
  %t582 = add i64 %t580, %t581
  %t583 = add i64 %t582, 1
  %t584 = call i8* @malloc(i64 %t583)
  %t585 = call i8* @strcpy(i8* %t584, i8* %t567)
  %t586 = call i8* @strcat(i8* %t584, i8* %t577)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t584)
  %t587 = getelementptr inbounds [27 x i8], [27 x i8]* @.str.35, i64 0, i64 0
  %t588 = load i8*, i8** %shorthandRecord.var, align 8
  %t589 = getelementptr inbounds [5 x i8], [5 x i8]* @.str.11, i64 0, i64 0
  %t590 = call i8* @_tl_record_get(i8* %t588, i8* %t589)
  %t591 = load i8*, i8** %thenValue.var, align 8
  %t592 = call double @earlyReturn(double 5.0)
  %t593 = call i8* @malloc(i64 64)
  %t594 = call i32 (i8*, i8*, ...) @sprintf(i8* %t593, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t592)
  %t595 = call i64 @strlen(i8* %t591)
  %t596 = call i64 @strlen(i8* %t593)
  %t597 = add i64 %t595, %t596
  %t598 = add i64 %t597, 1
  %t599 = call i8* @malloc(i64 %t598)
  %t600 = call i8* @strcpy(i8* %t599, i8* %t591)
  %t601 = call i8* @strcat(i8* %t599, i8* %t593)
  %t602 = call i64 @strlen(i8* %t590)
  %t603 = call i64 @strlen(i8* %t599)
  %t604 = add i64 %t602, %t603
  %t605 = add i64 %t604, 1
  %t606 = call i8* @malloc(i64 %t605)
  %t607 = call i8* @strcpy(i8* %t606, i8* %t590)
  %t608 = call i8* @strcat(i8* %t606, i8* %t599)
  %t609 = call i64 @strlen(i8* %t587)
  %t610 = call i64 @strlen(i8* %t606)
  %t611 = add i64 %t609, %t610
  %t612 = add i64 %t611, 1
  %t613 = call i8* @malloc(i64 %t612)
  %t614 = call i8* @strcpy(i8* %t613, i8* %t587)
  %t615 = call i8* @strcat(i8* %t613, i8* %t606)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t613)
  %t616 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.36, i64 0, i64 0
  %t617 = load %struct.GADTValue*, %struct.GADTValue** %pair.var, align 8
  %t618 = fptosi double 1.0 to i64
  %t619 = bitcast %struct.GADTValue* %t617 to i8*
  %t620 = bitcast i8* %t619 to %struct.Array*
  %t621 = getelementptr inbounds %struct.Array, %struct.Array* %t620, i32 0, i32 1
  %t622 = load i8**, i8*** %t621, align 8
  %t623 = getelementptr inbounds i8*, i8** %t622, i64 %t618
  %t624 = load i8*, i8** %t623, align 8
  %t625 = load %struct.GADTValue*, %struct.GADTValue** %pair.var, align 8
  %t626 = fptosi double 0.0 to i64
  %t627 = bitcast %struct.GADTValue* %t625 to i8*
  %t628 = bitcast i8* %t627 to %struct.Array*
  %t629 = getelementptr inbounds %struct.Array, %struct.Array* %t628, i32 0, i32 1
  %t630 = load i8**, i8*** %t629, align 8
  %t631 = getelementptr inbounds i8*, i8** %t630, i64 %t626
  %t632 = load i8*, i8** %t631, align 8
  %t633 = call i64 @strlen(i8* %t624)
  %t634 = call i64 @strlen(i8* %t632)
  %t635 = add i64 %t633, %t634
  %t636 = add i64 %t635, 1
  %t637 = call i8* @malloc(i64 %t636)
  %t638 = call i8* @strcpy(i8* %t637, i8* %t624)
  %t639 = call i8* @strcat(i8* %t637, i8* %t632)
  %t640 = call i64 @strlen(i8* %t616)
  %t641 = call i64 @strlen(i8* %t637)
  %t642 = add i64 %t640, %t641
  %t643 = add i64 %t642, 1
  %t644 = call i8* @malloc(i64 %t643)
  %t645 = call i8* @strcpy(i8* %t644, i8* %t616)
  %t646 = call i8* @strcat(i8* %t644, i8* %t637)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t644)
  %t647 = getelementptr inbounds [31 x i8], [31 x i8]* @.str.37, i64 0, i64 0
  %t648 = load %struct.Array*, %struct.Array** %oddsSquared.var, align 8
  %t649 = fptosi double 1.0 to i64
  %t650 = getelementptr inbounds %struct.Array, %struct.Array* %t648, i32 0, i32 1
  %t651 = load i8**, i8*** %t650, align 8
  %t652 = getelementptr inbounds i8*, i8** %t651, i64 %t649
  %t653 = load i8*, i8** %t652, align 8
  %t654 = call i64 @strlen(i8* %t647)
  %t655 = call i64 @strlen(i8* %t653)
  %t656 = add i64 %t654, %t655
  %t657 = add i64 %t656, 1
  %t658 = call i8* @malloc(i64 %t657)
  %t659 = call i8* @strcpy(i8* %t658, i8* %t647)
  %t660 = call i8* @strcat(i8* %t658, i8* %t653)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t658)
  %t661 = getelementptr inbounds [21 x i8], [21 x i8]* @.str.38, i64 0, i64 0
  %t662 = load i8*, i8** %label.var, align 8
  %t663 = load double, double* %loopTotal.var, align 8
  %t664 = call i8* @malloc(i64 64)
  %t665 = call i32 (i8*, i8*, ...) @sprintf(i8* %t664, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t663)
  %t666 = call i64 @strlen(i8* %t662)
  %t667 = call i64 @strlen(i8* %t664)
  %t668 = add i64 %t666, %t667
  %t669 = add i64 %t668, 1
  %t670 = call i8* @malloc(i64 %t669)
  %t671 = call i8* @strcpy(i8* %t670, i8* %t662)
  %t672 = call i8* @strcat(i8* %t670, i8* %t664)
  %t673 = call i64 @strlen(i8* %t661)
  %t674 = call i64 @strlen(i8* %t670)
  %t675 = add i64 %t673, %t674
  %t676 = add i64 %t675, 1
  %t677 = call i8* @malloc(i64 %t676)
  %t678 = call i8* @strcpy(i8* %t677, i8* %t661)
  %t679 = call i8* @strcat(i8* %t677, i8* %t670)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t677)
  %t680 = getelementptr inbounds [9 x i8], [9 x i8]* @.str.39, i64 0, i64 0
  %t681 = load i8*, i8** %dayKind.var, align 8
  %t682 = call i64 @strlen(i8* %t680)
  %t683 = call i64 @strlen(i8* %t681)
  %t684 = add i64 %t682, %t683
  %t685 = add i64 %t684, 1
  %t686 = call i8* @malloc(i64 %t685)
  %t687 = call i8* @strcpy(i8* %t686, i8* %t680)
  %t688 = call i8* @strcat(i8* %t686, i8* %t681)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t686)
  %t689 = getelementptr inbounds [13 x i8], [13 x i8]* @.str.40, i64 0, i64 0
  %t690 = call i8* @malloc(i64 16)
  %t691 = bitcast i8* %t690 to %struct.GADTValue*
  %t692 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t691, i32 0, i32 0
  store i32 0, i32* %t692, align 4
  %t693 = call i8* @malloc(i64 8)
  %t694 = fadd double 12.0, 0.0
  %t695 = bitcast double %t694 to i64
  %t696 = inttoptr i64 %t695 to i8*
  %t697 = getelementptr inbounds i8, i8* %t693, i64 0
  %t698 = bitcast i8* %t697 to i8**
  store i8* %t696, i8** %t698, align 8
  %t699 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t691, i32 0, i32 1
  store i8* %t693, i8** %t699, align 8
  %t700 = call i8* @describe(%struct.GADTValue* %t691)
  %t701 = call i8* @malloc(i64 16)
  %t702 = bitcast i8* %t701 to %struct.GADTValue*
  %t703 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t702, i32 0, i32 0
  store i32 0, i32* %t703, align 4
  %t704 = call i8* @malloc(i64 8)
  %t705 = fadd double 9.0, 0.0
  %t706 = bitcast double %t705 to i64
  %t707 = inttoptr i64 %t706 to i8*
  %t708 = getelementptr inbounds i8, i8* %t704, i64 0
  %t709 = bitcast i8* %t708 to i8**
  store i8* %t707, i8** %t709, align 8
  %t710 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t702, i32 0, i32 1
  store i8* %t704, i8** %t710, align 8
  %t711 = call i8* @malloc(i64 16)
  %t712 = bitcast i8* %t711 to %struct.GADTValue*
  %t713 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t712, i32 0, i32 0
  store i32 0, i32* %t713, align 4
  %t714 = call i8* @malloc(i64 8)
  %t715 = fadd double 4.0, 0.0
  %t716 = bitcast double %t715 to i64
  %t717 = inttoptr i64 %t716 to i8*
  %t718 = getelementptr inbounds i8, i8* %t714, i64 0
  %t719 = bitcast i8* %t718 to i8**
  store i8* %t717, i8** %t719, align 8
  %t720 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t712, i32 0, i32 1
  store i8* %t714, i8** %t720, align 8
  %t721 = call i8* @malloc(i64 16)
  %t722 = bitcast i8* %t721 to %struct.GADTValue*
  %t723 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t722, i32 0, i32 0
  store i32 1, i32* %t723, align 4
  %t724 = call i8* @malloc(i64 16)
  %t725 = bitcast %struct.GADTValue* %t702 to i8*
  %t726 = getelementptr inbounds i8, i8* %t724, i64 0
  %t727 = bitcast i8* %t726 to i8**
  store i8* %t725, i8** %t727, align 8
  %t728 = bitcast %struct.GADTValue* %t712 to i8*
  %t729 = getelementptr inbounds i8, i8* %t724, i64 8
  %t730 = bitcast i8* %t729 to i8**
  store i8* %t728, i8** %t730, align 8
  %t731 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t722, i32 0, i32 1
  store i8* %t724, i8** %t731, align 8
  %t732 = call double @evaluateNumber(%struct.GADTValue* %t722)
  %t733 = call i8* @malloc(i64 64)
  %t734 = call i32 (i8*, i8*, ...) @sprintf(i8* %t733, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t732)
  %t735 = call i64 @strlen(i8* %t700)
  %t736 = call i64 @strlen(i8* %t733)
  %t737 = add i64 %t735, %t736
  %t738 = add i64 %t737, 1
  %t739 = call i8* @malloc(i64 %t738)
  %t740 = call i8* @strcpy(i8* %t739, i8* %t700)
  %t741 = call i8* @strcat(i8* %t739, i8* %t733)
  %t742 = call i64 @strlen(i8* %t689)
  %t743 = call i64 @strlen(i8* %t739)
  %t744 = add i64 %t742, %t743
  %t745 = add i64 %t744, 1
  %t746 = call i8* @malloc(i64 %t745)
  %t747 = call i8* @strcpy(i8* %t746, i8* %t689)
  %t748 = call i8* @strcat(i8* %t746, i8* %t739)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t746)
  %t749 = getelementptr inbounds [32 x i8], [32 x i8]* @.str.41, i64 0, i64 0
  %t750 = load %struct.GADTValue*, %struct.GADTValue** %pair.var, align 8
  %t751 = bitcast %struct.GADTValue* %t750 to i8*
  %t752 = call i8* @describePair(i8* %t751)
  %t753 = load i8*, i8** %user.var, align 8
  %t754 = call i8* @readRecord(i8* %t753)
  %t755 = call i8* @literalMatch(double 1.0)
  %t756 = call i64 @strlen(i8* %t754)
  %t757 = call i64 @strlen(i8* %t755)
  %t758 = add i64 %t756, %t757
  %t759 = add i64 %t758, 1
  %t760 = call i8* @malloc(i64 %t759)
  %t761 = call i8* @strcpy(i8* %t760, i8* %t754)
  %t762 = call i8* @strcat(i8* %t760, i8* %t755)
  %t763 = call i64 @strlen(i8* %t752)
  %t764 = call i64 @strlen(i8* %t760)
  %t765 = add i64 %t763, %t764
  %t766 = add i64 %t765, 1
  %t767 = call i8* @malloc(i64 %t766)
  %t768 = call i8* @strcpy(i8* %t767, i8* %t752)
  %t769 = call i8* @strcat(i8* %t767, i8* %t760)
  %t770 = call i64 @strlen(i8* %t749)
  %t771 = call i64 @strlen(i8* %t767)
  %t772 = add i64 %t770, %t771
  %t773 = add i64 %t772, 1
  %t774 = call i8* @malloc(i64 %t773)
  %t775 = call i8* @strcpy(i8* %t774, i8* %t749)
  %t776 = call i8* @strcat(i8* %t774, i8* %t767)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t774)
  %t777 = getelementptr inbounds [22 x i8], [22 x i8]* @.str.42, i64 0, i64 0
  %t784 = bitcast i8* (i8*)* @.lambda_5 to i8*
  %t785 = call i8* @malloc(i64 16)
  %t786 = bitcast i8* %t785 to %struct.GADTValue*
  %t787 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t786, i32 0, i32 0
  store i32 0, i32* %t787, align 4
  %t788 = call i8* @malloc(i64 16)
  %t789 = fadd double 8.0, 0.0
  %t790 = bitcast double %t789 to i64
  %t791 = inttoptr i64 %t790 to i8*
  %t792 = getelementptr inbounds i8, i8* %t788, i64 0
  %t793 = bitcast i8* %t792 to i8**
  store i8* %t791, i8** %t793, align 8
  %t794 = getelementptr inbounds i8, i8* %t788, i64 8
  %t795 = bitcast i8* %t794 to i8**
  store i8* %t784, i8** %t795, align 8
  %t796 = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* %t786, i32 0, i32 1
  store i8* %t788, i8** %t796, align 8
  %t797 = call i8* @showPacked(%struct.GADTValue* %t786)
  %t798 = call i64 @strlen(i8* %t777)
  %t799 = call i64 @strlen(i8* %t797)
  %t800 = add i64 %t798, %t799
  %t801 = add i64 %t800, 1
  %t802 = call i8* @malloc(i64 %t801)
  %t803 = call i8* @strcpy(i8* %t802, i8* %t777)
  %t804 = call i8* @strcat(i8* %t802, i8* %t797)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t802)
  %t805 = bitcast %struct.GADTValue* (%struct.GADTValue*)* @identity to i8*
  %t806 = call i8* @usePolymorphic(i8* %t805)
  store i8* %t806, i8** %rankResults.var, align 8
  store i8* %t806, i8** @rankResults, align 8
  %t807 = getelementptr inbounds [14 x i8], [14 x i8]* @.str.43, i64 0, i64 0
  %t808 = load i8*, i8** %rankResults.var, align 8
  %t809 = fptosi double 0.0 to i64
  %t810 = bitcast i8* %t808 to %struct.Array*
  %t811 = getelementptr inbounds %struct.Array, %struct.Array* %t810, i32 0, i32 1
  %t812 = load i8**, i8*** %t811, align 8
  %t813 = getelementptr inbounds i8*, i8** %t812, i64 %t809
  %t814 = load i8*, i8** %t813, align 8
  %t815 = load i8*, i8** %rankResults.var, align 8
  %t816 = fptosi double 1.0 to i64
  %t817 = bitcast i8* %t815 to %struct.Array*
  %t818 = getelementptr inbounds %struct.Array, %struct.Array* %t817, i32 0, i32 1
  %t819 = load i8**, i8*** %t818, align 8
  %t820 = getelementptr inbounds i8*, i8** %t819, i64 %t816
  %t821 = load i8*, i8** %t820, align 8
  %t822 = call i64 @strlen(i8* %t814)
  %t823 = call i64 @strlen(i8* %t821)
  %t824 = add i64 %t822, %t823
  %t825 = add i64 %t824, 1
  %t826 = call i8* @malloc(i64 %t825)
  %t827 = call i8* @strcpy(i8* %t826, i8* %t814)
  %t828 = call i8* @strcat(i8* %t826, i8* %t821)
  %t829 = call i64 @strlen(i8* %t807)
  %t830 = call i64 @strlen(i8* %t826)
  %t831 = add i64 %t829, %t830
  %t832 = add i64 %t831, 1
  %t833 = call i8* @malloc(i64 %t832)
  %t834 = call i8* @strcpy(i8* %t833, i8* %t807)
  %t835 = call i8* @strcat(i8* %t833, i8* %t826)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t833)
  %t836 = getelementptr inbounds [19 x i8], [19 x i8]* @.str.44, i64 0, i64 0
  %t837 = load i8*, i8** %computation.var, align 8
  %t838 = load i8*, i8** %computation.var, align 8
  %t839 = call double @Option_getOrElse(i8* %t838, double 0.0)
  %t840 = call i8* @malloc(i64 64)
  %t841 = call i32 (i8*, i8*, ...) @sprintf(i8* %t840, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t839)
  %t842 = call i64 @strlen(i8* %t836)
  %t843 = call i64 @strlen(i8* %t840)
  %t844 = add i64 %t842, %t843
  %t845 = add i64 %t844, 1
  %t846 = call i8* @malloc(i64 %t845)
  %t847 = call i8* @strcpy(i8* %t846, i8* %t836)
  %t848 = call i8* @strcat(i8* %t846, i8* %t840)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t846)
  %t849 = getelementptr inbounds [45 x i8], [45 x i8]* @.str.45, i64 0, i64 0
  %t850 = load i8*, i8** %returnedComputation.var, align 8
  %t851 = load i8*, i8** %escapedText.var, align 8
  %t852 = call i64 @strlen(i8* %t850)
  %t853 = call i64 @strlen(i8* %t851)
  %t854 = add i64 %t852, %t853
  %t855 = add i64 %t854, 1
  %t856 = call i8* @malloc(i64 %t855)
  %t857 = call i8* @strcpy(i8* %t856, i8* %t850)
  %t858 = call i8* @strcat(i8* %t856, i8* %t851)
  %t859 = call i64 @strlen(i8* %t849)
  %t860 = call i64 @strlen(i8* %t856)
  %t861 = add i64 %t859, %t860
  %t862 = add i64 %t861, 1
  %t863 = call i8* @malloc(i64 %t862)
  %t864 = call i8* @strcpy(i8* %t863, i8* %t849)
  %t865 = call i8* @strcat(i8* %t863, i8* %t856)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t863)
  call void @printPlusOne(double 1.0)
  %t867 = getelementptr inbounds [20 x i8], [20 x i8]* @.str.46, i64 0, i64 0
  %t868 = load double, double* %selectedText.var, align 8
  %t869 = load double, double* %clipped.var, align 8
  %t870 = call i8* @malloc(i64 64)
  %t871 = call i32 (i8*, i8*, ...) @sprintf(i8* %t870, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t869)
  %t872 = call i8* @malloc(i64 64)
  %t873 = call i32 (i8*, i8*, ...) @sprintf(i8* %t872, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double %t868)
  %t874 = call i64 @strlen(i8* %t872)
  %t875 = call i64 @strlen(i8* %t870)
  %t876 = add i64 %t874, %t875
  %t877 = add i64 %t876, 1
  %t878 = call i8* @malloc(i64 %t877)
  %t879 = call i8* @strcpy(i8* %t878, i8* %t872)
  %t880 = call i8* @strcat(i8* %t878, i8* %t870)
  %t881 = call i64 @strlen(i8* %t867)
  %t882 = call i64 @strlen(i8* %t878)
  %t883 = add i64 %t881, %t882
  %t884 = add i64 %t883, 1
  %t885 = call i8* @malloc(i64 %t884)
  %t886 = call i8* @strcpy(i8* %t885, i8* %t867)
  %t887 = call i8* @strcat(i8* %t885, i8* %t878)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t885)
  %t888 = getelementptr inbounds [27 x i8], [27 x i8]* @.str.47, i64 0, i64 0
  %t889 = load double, double* %scopedResult.var, align 8
  %t890 = call i8* @report(double %t889)
  %t891 = call i64 @strlen(i8* %t888)
  %t892 = call i64 @strlen(i8* %t890)
  %t893 = add i64 %t891, %t892
  %t894 = add i64 %t893, 1
  %t895 = call i8* @malloc(i64 %t894)
  %t896 = call i8* @strcpy(i8* %t895, i8* %t888)
  %t897 = call i8* @strcat(i8* %t895, i8* %t890)
  call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* %t895)
  call void @fallThroughDemo(double 1.0)
  ret i32 0
}