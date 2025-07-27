import { describe, expect, it } from 'vitest'
import LLVM, { Context, IRBuilder, Module, Type, Value } from './index'

// basic context and module creation
describe('llvm-bun', () => {
	it('creates a context and module', () => {
		const ctx = new Context()
		const mod = new Module('test', ctx)
		expect(ctx.handle).toBeTruthy()
		expect(mod.handle).toBeTruthy()
		expect(mod.getContext()).toBe(ctx)
	})

	it('creates integer and float types', () => {
		const ctx = new Context()
		const i32 = Type.int32(ctx)
		const f64 = Type.double(ctx)
		expect(i32.isInt()).toBe(true)
		expect(i32.isInt(32)).toBe(true)
		expect(i32.getBitWidth()).toBe(32)
		expect(f64.isDouble()).toBe(true)
		expect(f64.isFloat()).toBe(false)
	})

	it('creates pointer types', () => {
		const ctx = new Context()
		const i8 = Type.int8(ctx)
		const ptr = Type.pointer(i8)
		expect(ptr.isPointer()).toBe(true)
	})

	it('creates function and basic block', () => {
		const ctx = new Context()
		const mod = new Module('test', ctx)
		const fnType = new LLVM.FunctionType([Type.int32(ctx), Type.int32(ctx)], Type.int32(ctx))
		const fn = mod.createFunction('add', fnType)
		const block = fn.addBlock('entry')
		expect(fn.handle).toBeTruthy()
		expect(block.handle).toBeTruthy()
	})

	it('builds simple ir with irbuilder', () => {
		const ctx = new Context()
		const mod = new Module('test', ctx)
		const fnType = new LLVM.FunctionType([Type.int32(ctx), Type.int32(ctx)], Type.int32(ctx))
		const fn = mod.createFunction('add', fnType)
		const entry = fn.addBlock('entry')
		const builder = new IRBuilder(ctx)
		builder.insertInto(entry)
		const args = fn.getArgs()
		const sum = builder.add(args[0], args[1])
		builder.ret(sum)
		const ir = mod.toString()
		expect(ir).toMatch(/define i32 @add/)
		expect(ir).toMatch(/add i32/)
	})

	it('creates and inspects constants', () => {
		const ctx = new Context()
		const i32 = Type.int32(ctx)
		const v = Value.constInt(i32, 42)
		expect(v.handle).toBeTruthy()
		const t = v.getType()
		expect(t.isInt(32)).toBe(true)
	})

	it('alloca, store, load', () => {
		const ctx = new Context()
		const mod = new Module('test', ctx)
		const fnType = new LLVM.FunctionType([], Type.void(ctx))
		const fn = mod.createFunction('main', fnType)
		const entry = fn.addBlock('entry')
		const builder = new IRBuilder(ctx)
		builder.insertInto(entry)
		const i32 = Type.int32(ctx)
		const ptr = builder.alloca(i32, 'x')
		const val = Value.constInt(i32, 123)
		builder.store(val, ptr)
		const loaded = builder.load(ptr)
		expect(loaded.handle).toBeTruthy()
	})
})
