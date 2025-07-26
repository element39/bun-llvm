import {
	LLVMAddFunction,
	LLVMAppendBasicBlockInContext,
	LLVMBuildAdd,
	LLVMBuildRet,
	LLVMContextCreate,
	LLVMCreateBuilderInContext,
	LLVMFunctionType,
	LLVMGetParam,
	LLVMInt32TypeInContext,
	LLVMModuleCreateWithNameInContext,
	LLVMPositionBuilderAtEnd,
	LLVMPrintModuleToString,
	LLVMVerifyFunction,
	LLVMVerifyModule
} from "./ffi";

type Pointer = any;

class LLVMContext {
	ptr: Pointer;
	constructor() {
		this.ptr = LLVMContextCreate();
	}
}

class Module {
	ptr: Pointer;
	constructor(name: string, context: LLVMContext) {
		this.ptr = LLVMModuleCreateWithNameInContext(Buffer.from(name + "\0"), context.ptr);
	}
	print(): string {
		const cstr = LLVMPrintModuleToString(this.ptr);
		return cstr.toString();
	}
}

class IRBuilder {
	ptr: Pointer;
	constructor(context: LLVMContext) {
		this.ptr = LLVMCreateBuilderInContext(context.ptr);
	}
	getInt32Ty(context: LLVMContext) {
		return LLVMInt32TypeInContext(context.ptr);
	}
	setInsertPoint(bb: BasicBlock) {
		LLVMPositionBuilderAtEnd(this.ptr, bb.ptr);
	}
	createAdd(a: Pointer, b: Pointer) {
		return LLVMBuildAdd(this.ptr, a, b, Buffer.from("addtmp\0"));
	}
	createRet(val: Pointer) {
		return LLVMBuildRet(this.ptr, val);
	}
}

class FunctionType {
	static get(returnType: Pointer, paramTypes: Pointer[], isVarArg: boolean, context: LLVMContext) {

		const buf = Buffer.allocUnsafe(paramTypes.length * 8);
		for (let i = 0; i < paramTypes.length; ++i) {
			buf.writeBigUInt64LE(BigInt(paramTypes[i]), i * 8);
		}
		return LLVMFunctionType(returnType, buf, paramTypes.length, isVarArg);
	}
}

enum LinkageTypes {
		ExternalLinkage = 0,
		InternalLinkage = 1,
}

class Function {
	ptr: Pointer;
	constructor(ptr: Pointer) { this.ptr = ptr; }
	getArg(idx: number) { return LLVMGetParam(this.ptr, idx); }
	static Create(fnType: Pointer, linkage: number, name: string, module: Module) {
		return new Function(LLVMAddFunction(module.ptr, Buffer.from(name + "\0"), fnType));
	}
}

class BasicBlock {
	ptr: Pointer;
	constructor(ptr: Pointer) { this.ptr = ptr; }
	static Create(context: LLVMContext, name: string, func: Function) {
		return new BasicBlock(LLVMAppendBasicBlockInContext(context.ptr, func.ptr, Buffer.from(name + "\0")));
	}
}

function verifyFunction(func: Function): boolean {
	return !!LLVMVerifyFunction(func.ptr, 0);
}
function verifyModule(module: Module): boolean {
	return !!LLVMVerifyModule(module.ptr, 0, null);
}

const llvm = {
	LLVMContext,
	Module,
	IRBuilder,
	FunctionType,
	Function,
	BasicBlock,
	LinkageTypes,
	verifyFunction,
	verifyModule
};

export default llvm;
