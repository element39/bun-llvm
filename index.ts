// https://www.npmjs.com/package/llvm-bindings
import llvm from "./llvm";

function main(): void {
    const context = new llvm.LLVMContext();
    const module = new llvm.Module("demo", context);
    const builder = new llvm.IRBuilder(context);

    const returnType = builder.getInt32Ty(context);
    const paramTypes = [builder.getInt32Ty(context), builder.getInt32Ty(context)];
    const functionType = llvm.FunctionType.get(returnType, paramTypes, false, context);
    const func = llvm.Function.Create(functionType, llvm.LinkageTypes.ExternalLinkage, "add", module);

    const entryBB = llvm.BasicBlock.Create(context, "entry", func);
    builder.setInsertPoint(entryBB);
    const a = func.getArg(0);
    const b = func.getArg(1);
    const result = builder.createAdd(a, b);
    builder.createRet(result);

    if (llvm.verifyFunction(func)) {
        console.error("Verifying function failed");
        return;
    }
    if (llvm.verifyModule(module)) {
        console.error("Verifying module failed");
        return;
    }
    console.log(module.print());
}

main();
