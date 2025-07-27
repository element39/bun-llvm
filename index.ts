import LLVM from "./llvm";

function main() {
	// initialize LLVM
	const ctx = new LLVM.Context();
	const mod = new LLVM.Module("demo", ctx);
	const builder = new LLVM.IRBuilder(ctx);

	// define types
	const i32 = LLVM.Type.int32(ctx);
	const fnType = new LLVM.FunctionType([i32, i32], i32);

	// {} are used to separate scopes (optional)
	{
		// create the function
		const fn = mod.createFunction("add", fnType, { linkage: LLVM.Linkage.External });
		const entry = fn.addBlock("entry");

		builder.insertInto(entry);
		
		{
			// get parameters & add them
			const [a, b] = fn.getArgs();
			const sum = builder.add(a, b);
			
			// return the result
			builder.ret(sum);
		}

		// make sure the function is valid
		fn.verify();
	}
	
	// verify the module
	mod.verify();
	
	// output IR
	console.log(mod.toString());
}

main();