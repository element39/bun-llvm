import { dlopen } from "bun:ffi";

const lib = dlopen("./LLVM-C.dll", {

	// context & module
	LLVMContextCreate: { args: [], returns: "ptr" },
	LLVMModuleCreateWithNameInContext: { args: ["cstring", "ptr"], returns: "ptr" },
	LLVMCreateBuilderInContext: { args: ["ptr"], returns: "ptr" },

	// types
	LLVMInt1TypeInContext: { args: ["ptr"], returns: "ptr" },

	LLVMInt8TypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMInt16TypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMInt32TypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMInt64TypeInContext: { args: ["ptr"], returns: "ptr" },

	LLVMFloatTypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMDoubleTypeInContext: { args: ["ptr"], returns: "ptr" },

	LLVMVoidTypeInContext: { args: ["ptr"], returns: "ptr" },
	LLVMPointerType: { args: ["ptr", "uint32_t"], returns: "ptr" },

	// functions & blocks
	LLVMFunctionType: { args: ["ptr", "ptr", "uint32_t", "bool"], returns: "ptr" },
	LLVMAddFunction: { args: ["ptr", "cstring", "ptr"], returns: "ptr" },
	LLVMAppendBasicBlockInContext: { args: ["ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMGetParam: { args: ["ptr", "uint32_t"], returns: "ptr" },

	// ir building
	LLVMPositionBuilderAtEnd: { args: ["ptr", "ptr"], returns: "void" },
	LLVMBuildAdd: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildSub: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildMul: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildSDiv: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildUDiv: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildFDiv: { args: ["ptr", "ptr", "ptr", "cstring"], returns: "ptr" },
	LLVMBuildRet: { args: ["ptr", "ptr"], returns: "ptr" },
	LLVMBuildBr: { args: ["ptr", "ptr"], returns: "ptr" },
	LLVMBuildCondBr: { args: ["ptr", "ptr", "ptr", "ptr"], returns: "ptr" },

	// constants
	LLVMConstInt: { args: ["ptr", "uint64_t", "bool"], returns: "ptr" },
	LLVMConstReal: { args: ["ptr", "double"], returns: "ptr" },

	// utils
	LLVMPrintModuleToString: { args: ["ptr"], returns: "cstring" },
	LLVMVerifyFunction: { args: ["ptr", "uint32_t"], returns: "int" },
	LLVMVerifyModule: { args: ["ptr", "uint32_t", "ptr"], returns: "int" },

});

export const {
	LLVMContextCreate,
	LLVMModuleCreateWithNameInContext,
	LLVMCreateBuilderInContext,

	LLVMInt1TypeInContext,
	LLVMInt8TypeInContext,
	LLVMInt16TypeInContext,
	LLVMInt32TypeInContext,
	LLVMInt64TypeInContext,
	LLVMFloatTypeInContext,
	LLVMDoubleTypeInContext,
	LLVMVoidTypeInContext,
	LLVMPointerType,

	LLVMFunctionType,
	LLVMAddFunction,
	LLVMAppendBasicBlockInContext,
	LLVMGetParam,
	LLVMBuildRet,
	
	LLVMBuildAdd,
	LLVMBuildSub,

	LLVMBuildMul,
	LLVMBuildSDiv,
	LLVMBuildUDiv,
	LLVMBuildFDiv,
	
	LLVMBuildBr,
	LLVMBuildCondBr,

	LLVMPositionBuilderAtEnd,
	LLVMPrintModuleToString,
	LLVMVerifyFunction,
	LLVMVerifyModule,

	LLVMConstInt,
	LLVMConstReal
} = lib.symbols;

