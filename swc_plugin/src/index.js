const Visitor = require("@swc/core/Visitor").default;
const { transformSync } = require("@swc/core");
const fs = require("fs");
const path = require("path");

class PluginTransformImport extends Visitor {
  visitModuleItems(nodes) {
    const transformedNodes = [];

    for (const node of nodes) {
      const { type, source, specifiers } = node;

      if (type === "ImportDefaultSpecifier") {
        transformedNodes.push(node);
        continue;
      }

      specifiers.forEach((v) => {
        const name = v.local.value;
        const type = v.type;

        if (type === "ImportSpecifier") {
          const newSpecifier = {
            ...v,
            imported: null,
            type: "ImportDefaultSpecifier",
          };
          const value = `${source.value}/lib/${name}`;

          const copyNode = {
            ...node,
            source: {
              ...source,
              value,
            },
            specifiers: [newSpecifier],
            type: "ImportDeclaration",
          };

          transformedNodes.push(copyNode);
        }
      });
    }
    return transformedNodes;
  }
}

const transform = (content) => {
  const code =
    transformSync(content, {
      plugin: (v) => new PluginTransformImport().visitProgram(v),
    })?.code ?? "";

  fs.writeFileSync(path.join(__dirname, "../../demo_transform_swc.txt"), code);
};

console.time("transform_swc");

console.timeLog("transform_swc");

const content = fs
  .readFileSync(path.join(__dirname, "../../demo.txt"))
  .toString();

transform(content);

console.timeEnd("transform_swc");
