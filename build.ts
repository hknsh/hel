/** SaltyAtom/Elysia **/
import { $ } from "bun";
import { type Options, build } from "tsup";

const config: Options = {
	entry: ["src/**/*.ts"],
	splitting: false,
	sourcemap: false,
	clean: true,
	bundle: false,
	minify: false,
} satisfies Options;

await Promise.all([
	build({
		outDir: "dist",
		format: "esm",
		target: "node20",
		cjsInterop: false,
		...config,
	}),
	build({
		outDir: "dist",
		format: "cjs",
		target: "node20",
		...config,
	}),
]);

const glob = new Bun.Glob("./dist/**/*.mjs");

for await (const entry of glob.scan(".")) {
	const content = await Bun.file(entry).text();
	await Bun.write(
		entry,
		content
			.replace(
				/(import|export)\s*\{([a-zA-Z0-9_,\s$]*)\}\s*from\s*['"]([a-zA-Z0-9./-]*[./][a-zA-Z0-9./-]*)['"]/g,
				'$1{$2}from"$3.mjs"',
			)
			.replace(
				/(import|export) ([a-zA-Z0-9_$]+) from\s*['"]([a-zA-Z0-9./-]*[./][a-zA-Z0-9./-]*)['"]/g,
				'$1 $2 from"$3.mjs"',
			),
	);
}

await $`tsc --project tsconfig.dts.json`;

await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist/bun",
	minify: {
		whitespace: true,
		syntax: true,
		identifiers: false,
	},
	target: "bun",
	sourcemap: "external",
	external: ["effect", "reflect-metadata"],
});

await Promise.all([$`cp dist/*.d.ts dist/cjs`]);

await $`cp dist/index*.d.ts dist/bun`;

process.exit();
