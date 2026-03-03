import tailwind from "bun-plugin-tailwind";

await Bun.build({
	entrypoints: ["./src/web/index.html"],
	outdir: "./dist",
	plugins: [tailwind],
});

console.log("Build complete → dist/");
