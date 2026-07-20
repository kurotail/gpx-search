const fs = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectRoot, "dist");

const readProjectFile = (relativePath) =>
    fs.readFile(path.join(projectRoot, relativePath), "utf8");

function removeModuleSyntax(source) {
    return source
        .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\r?\n/gm, "")
        .replace(/^export\s+\{[^}]+\};\r?\n/gm, "")
        .replace(/^export\s+/gm, "");
}

async function build() {
    const [html, styles, parser, gpx, navigation, ui, main] = await Promise.all([
        readProjectFile("index.html"),
        readProjectFile("src/styles.css"),
        readProjectFile("node_modules/gpxparser/dist/GPXParser.min.js"),
        readProjectFile("src/gpx.js"),
        readProjectFile("src/navigation.js"),
        readProjectFile("src/ui.js"),
        readProjectFile("src/main.js")
    ]);

    const application = [gpx, navigation, ui, main]
        .map(removeModuleSyntax)
        .join("\n\n");

    const staticHtml = html
        .replace(
            '<link rel="stylesheet" href="./src/styles.css">',
            `<style>\n${styles}\n</style>`
        )
        .replace(
            /\s*<script src="\.\/node_modules\/gpxparser\/dist\/GPXParser\.min\.js"><\/script>\s*<script>window\.GPXParser = gpxParser;<\/script>\s*<script type="module" src="\.\/src\/main\.js"><\/script>/,
            `\n    <script>\n${parser}\nwindow.GPXParser = gpxParser;\n\n${application}\n    </script>`
        );

    if (staticHtml.includes("./src/") || staticHtml.includes("./node_modules/")) {
        throw new Error("Static build still contains an external project asset reference.");
    }

    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.writeFile(path.join(outputDirectory, "index.html"), staticHtml);
    console.log("Built dist/index.html");
}

build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
