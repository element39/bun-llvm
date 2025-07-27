import {
	LLVMAddFunction,
	LLVMAppendBasicBlockInContext,
	LLVMBuildAdd,
	LLVMBuildAlloca,
	LLVMBuildBr,
	LLVMBuildCondBr,
	LLVMBuildFDiv,
	LLVMBuildLoad,
	LLVMBuildMul,
	LLVMBuildRet,
	LLVMBuildSDiv,
	LLVMBuildStore,
	LLVMBuildSub,
	LLVMBuildUDiv,
	LLVMConstInt,
	LLVMConstReal,
	LLVMContextCreate,
	LLVMCreateBuilderInContext,
	LLVMDoubleTypeInContext,
	LLVMFloatTypeInContext,
	LLVMFunctionType,
	LLVMGetParam,
	LLVMInt16TypeInContext,
	LLVMInt1TypeInContext,
	LLVMInt32TypeInContext,
	LLVMInt64TypeInContext,
	LLVMInt8TypeInContext,
	LLVMModuleCreateWithNameInContext,
	LLVMPointerType,
	LLVMPositionBuilderAtEnd,
	LLVMPrintModuleToString,
	LLVMVerifyFunction,
	LLVMVerifyModule,
	LLVMVoidTypeInContext
} from "./ffi";

type Pointer = any;

export enum Linkage {
	External = 0,
	Internal = 1,
}

/**
 context for llvm objects
*/
export class Context {
	private ptr: Pointer;

	/**
	 create a new context
	*/
	constructor() {
		this.ptr = LLVMContextCreate();
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

/**
 module holds functions and global data
*/
export class Module {
	private ptr: Pointer;
	private context: Context;

	/**
	 create a new module
	 @param name name of the module
	 @param context llvm context
	*/
	constructor(name: string, context: Context) {
		this.context = context;
		this.ptr = LLVMModuleCreateWithNameInContext(Buffer.from(name + "\0"), context.handle);
	}

	/**
	 add a function to the module
	 @param name function name
	 @param fnType function type
	 @param opts options
	 @returns the function object
	*/
	createFunction(name: string, fnType: FunctionType, opts?: { linkage?: Linkage }): Func {
		const fnPtr = LLVMAddFunction(this.ptr, Buffer.from(name + "\0"), fnType.handle);
		const func = new Func(fnPtr, this);
		(func as any)._paramCount = (fnType as any)._paramCount ?? (fnType as any).paramCount ?? (fnType as any).params?.length ?? 2;
		return func;
	}

	/**
	 check if the module is valid
	*/
	verify(): void {
		if (LLVMVerifyModule(this.ptr, 0, null)) throw new Error("Module verification failed");
	}

	/**
	 get the ir as a string
	*/
	toString(): string {
		const cstr = LLVMPrintModuleToString(this.ptr);
		return cstr.toString();
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }

	/**
	 get the context
	*/
	getContext() { return this.context; }
}

/**
 describes a function type
*/
export class FunctionType {
	private ptr: Pointer;

	/**
	 create a function type
	 @param params parameter types
	 @param ret return type
	 @param isVarArg is variadic
	*/
	constructor(params: Type[], ret: Type, isVarArg = false) {
		const buf = Buffer.allocUnsafe(params.length * 8);
		for (let i = 0; i < params.length; ++i) {
			if (!params[i]) {
				throw new Error(`parameter at index ${i} is undefined, got`);
			}
			buf.writeBigUInt64LE(BigInt(params[i]!.handle), i * 8);
		}
		this.ptr = LLVMFunctionType(ret.handle, buf, params.length, isVarArg);
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

/**
 represents a function in the module
*/
export class Func {
	private ptr: Pointer;
	private module: Module;

	/**
	 create a function object
	 @param ptr pointer to the function
	 @param module parent module
	*/
	constructor(ptr: Pointer, module: Module) {
		this.ptr = ptr;
		this.module = module;
	}

	/**
	 add a basic block to the function
	 @param name block name
	 @returns the basic block
	*/
	addBlock(name: string): BasicBlock {
		return new BasicBlock(LLVMAppendBasicBlockInContext(this.module.getContext().handle, this.ptr, Buffer.from(name + "\0")), this);
	}

	/**
	 get a function argument by index
	 @param idx argument index
	 @returns the value
	*/
	getArg(idx: number): Value {
		return new Value(LLVMGetParam(this.ptr, idx));
	}

	/**
	 get all function arguments as an array
	 @returns array of values
	*/
	getArgs(): Value[] {
		const paramCount = (this as any)._paramCount ?? 2;
		return Array.from({ length: paramCount }, (_, i) => this.getArg(i));
	}

	/**
	 check if the function is valid
	*/
	verify(): void {
		if (LLVMVerifyFunction(this.ptr, 0)) throw new Error("Function verification failed");
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

/**
 represents a basic block in a function
*/
export class BasicBlock {
	private ptr: Pointer;
	private func: Func;

	/**
	 create a basic block object
	 @param ptr pointer to the block
	 @param func parent function
	*/
	constructor(ptr: Pointer, func: Func) {
		this.ptr = ptr;
		this.func = func;
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

export class IRBuilder {
	private ptr: Pointer;

	constructor(context: Context) {
		this.ptr = LLVMCreateBuilderInContext(context.handle);
	}

	/**
	 set where new instructions will be added in the given block
	 @param bb the block to insert into
	 */
	insertInto(bb: BasicBlock): void {
		LLVMPositionBuilderAtEnd(this.ptr, bb.handle);
	}

	/**
	 allocate memory on the stack
	 @param type the type to allocate
	 @param name variable name
	 @returns a pointer to the allocated memory
	 */
	alloca(type: Type, name = "alloca"): Value {
		return new Value(LLVMBuildAlloca(this.ptr, type.handle, Buffer.from(name + "\0")));
	}

	/**
	 store a value in memory
	 @param value the value to store
	 @param ptr the pointer to store to
	 */
	store(value: Value, ptr: Value): void {
		LLVMBuildStore(this.ptr, value.handle, ptr.handle);
	}

	/**
	 load a value from memory
	 @param ptr the pointer to load from
	 @param name variable name
	 @returns the loaded value
	 */
	load(ptr: Value, name = "load"): Value {
		return new Value(LLVMBuildLoad(this.ptr, ptr.handle, Buffer.from(name + "\0")));
	}

	/**
	 add two values
	 @param a first value
	 @param b second value
	 @returns the result value
	 */
	add(a: Value, b: Value): Value {
		return new Value(LLVMBuildAdd(this.ptr, a.handle, b.handle, Buffer.from("addtmp\0")));
	}

	/**
	 subtract two values
	 @param a first value
	 @param b second value
	 @returns the result value
	 */
	sub(a: Value, b: Value): Value {
		return new Value(LLVMBuildSub(this.ptr, a.handle, b.handle, Buffer.from("subtmp\0")));
	}

	/**
	 multiply two values
	 @param a first value
	 @param b second value
	 @returns the result value
	 */
	mul(a: Value, b: Value): Value {
		return new Value(LLVMBuildMul(this.ptr, a.handle, b.handle, Buffer.from("multmp\0")));
	}

	/**
	 signed integer division
	 @param a numerator
	 @param b denominator
	 @returns the result value
	 */
	sdiv(a: Value, b: Value): Value {
		return new Value(LLVMBuildSDiv(this.ptr, a.handle, b.handle, Buffer.from("sdivtmp\0")));
	}

	/**
	 unsigned integer division
	 @param a numerator
	 @param b denominator
	 @returns the result value
	 */
	udiv(a: Value, b: Value): Value {
		return new Value(LLVMBuildUDiv(this.ptr, a.handle, b.handle, Buffer.from("udivtmp\0")));
	}

	/**
	 floating point division
	 @param a numerator
	 @param b denominator
	 @returns the result value
	 */
	fdiv(a: Value, b: Value): Value {
		return new Value(LLVMBuildFDiv(this.ptr, a.handle, b.handle, Buffer.from("fdivtmp\0")));
	}

	/**
	 unconditional branch to a basic block
	 @param dest destination block
	 */
	br(dest: BasicBlock): void {
		LLVMBuildBr(this.ptr, dest.handle);
	}

	/**
	 conditional branch
	 @param cond condition value
	 @param thenBlock block if true
	 @param elseBlock block if false
	 */
	condBr(cond: Value, thenBlock: BasicBlock, elseBlock: BasicBlock): void {
		LLVMBuildCondBr(this.ptr, cond.handle, thenBlock.handle, elseBlock.handle);
	}

	/**
	 return from the function (with or without a value)
	 @param val the value to return (optional)
	 */
	ret(val?: Value): void {
		LLVMBuildRet(this.ptr, val ? val.handle : null);
	}
}

/**
 represents a type in llvm
*/
export class Type {
	private ptr: Pointer;
	private constructor(ptr: Pointer) { this.ptr = ptr; }

	/**
	 get i1 type
	*/
	static int1(context: Context): Type {
		return new Type(LLVMInt1TypeInContext(context.handle));
	}
	/**
	 get i8 type
	*/
	static int8(context: Context): Type {
		return new Type(LLVMInt8TypeInContext(context.handle));
	}
	/**
	 get i16 type
	*/
	static int16(context: Context): Type {
		return new Type(LLVMInt16TypeInContext(context.handle));
	}
	/**
	 get i32 type
	*/
	static int32(context: Context): Type {
		return new Type(LLVMInt32TypeInContext(context.handle));
	}
	/**
	 get i64 type
	*/
	static int64(context: Context): Type {
		return new Type(LLVMInt64TypeInContext(context.handle));
	}
	/**
	 get float type
	*/
	static float(context: Context): Type {
		return new Type(LLVMFloatTypeInContext(context.handle));
	}
	/**
	 get double type
	*/
	static double(context: Context): Type {
		return new Type(LLVMDoubleTypeInContext(context.handle));
	}
	/**
	 get void type
	*/
	static void(context: Context): Type {
		return new Type(LLVMVoidTypeInContext(context.handle));
	}
	/**
	 get pointer type
	 @param elementType type to point to
	 @param addressSpace address space
	*/
	static pointer(elementType: Type, addressSpace = 0): Type {
		return new Type(LLVMPointerType(elementType.handle, addressSpace));
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

/**
 represents a value in llvm
*/
export class Value {
	private ptr: Pointer;

	/**
	 create a value object
	 @param ptr pointer to the value
	*/
	constructor(ptr: Pointer) { this.ptr = ptr; }

	/**
	 create an integer constant
	 @param type the integer type
	 @param value the value
	 @param isSignedOverride whether to treat the value as signed (optional), llvm-bun tries to infer
	 */
	static constInt(type: Type, value: number | bigint, isSignedOverride?: boolean): Value {
		let isSigned = true;
		const typeName = type.constructor.name.toLowerCase();
		if (typeName.includes('uint')) isSigned = false;
		if (isSignedOverride !== undefined) isSigned = isSignedOverride;

		return new Value(LLVMConstInt(type.handle, BigInt(value), isSigned));
	}

	/**
	 create a floating point constant
	 @param type the float type
	 @param value the value
	 */
	static constFloat(type: Type, value: number): Value {
		return new Value(LLVMConstReal(type.handle, value));
	}

	/**
	 get the raw pointer
	*/
	get handle() { return this.ptr; }
}

const LLVM = {
	Context,
	Module,
	FunctionType,
	Func,
	BasicBlock,
	IRBuilder,
	Type,
	Linkage
};

export default LLVM;
