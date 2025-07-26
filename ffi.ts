import { dlopen } from "bun:ffi";

const lib = dlopen("./LLVM-C.dll", {
	LLVMContextCreate: { args: [], returns: "ptr" },
	LLVMModuleCreateWithNameInContext: { args: ["cstring", "ptr"], returns: "ptr" },
	LLVMCreateBuilderInContext: { args: ["ptr"], returns: "ptr" },
	LLVMInt32TypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMFunctionType: { args: ["ptr", "ptr", "uint32_t", "bool"], returns: "ptr" },
	LLVMAddFunction: { args: ["ptr", "cstring", "ptr"], returns: "ptr" },
	LLVMAppendBasicBlockInContext: { args: ["ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMPositionBuilderAtEnd: { args: ["ptr", "ptr"], returns: "void" },
	LLVMGetParam: { args: ["ptr", "uint32_t"], returns: "ptr" },
	LLVMBuildAdd: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildRet: { args: ["ptr", "ptr"], returns: "ptr" },
	LLVMPrintModuleToString: { args: ["ptr"], returns: "cstring" },
	LLVMVerifyFunction: { args: ["ptr", "uint32_t"], returns: "int" },
	LLVMVerifyModule: { args: ["ptr", "uint32_t", "ptr"], returns: "int" },
});

export const {
	LLVMContextCreate,
	LLVMModuleCreateWithNameInContext,
	LLVMCreateBuilderInContext,
	LLVMInt32TypeInContext,
	LLVMFunctionType,
	LLVMAddFunction,
	LLVMAppendBasicBlockInContext,
	LLVMPositionBuilderAtEnd,
	LLVMGetParam,
	LLVMBuildAdd,
	LLVMBuildRet,
	LLVMPrintModuleToString,
	LLVMVerifyFunction,
	LLVMVerifyModule
} = lib.symbols;

