import { readdir } from "node:fs/promises";
import { join } from "node:path";

const walk = async (dirPath) =>
	Promise.all(
		await readdir(dirPath, { withFileTypes: true }).then((entries) =>
			entries.map((entry) => {
				const childPath = join(dirPath, entry.name);
				return entry.isDirectory() ? walk(childPath) : childPath;
			}),
		),
	);

const toHtml = (path) =>
	path.replace("markdown", "public").replace(".md", ".html");

const toDir = (path) =>
	path.replace("markdown", "public").split("/").slice(0, -1).join("/");

const build = async (path) => {
	await $`mkdir -p ${toDir(path)}`;
	await $`marp ${path} -o ${toHtml(path)}`;
};

const buildFiles = async (files) => {
	for (const file of files) {
		console.log("building file ", file);
		if (typeof file === "string") {
			await build(file);
		} else {
			await buildFiles(file);
		}
	}
};

const files = await walk("markdown");

await buildFiles(files);

console.log(JSON.stringify(files, null, 4));
