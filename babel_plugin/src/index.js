const { traverse, parseSync, types: t } = require("@babel/core");
const generator = require("@babel/generator").default;

const fs = require("fs");
const path = require("path");

const transform = (content) => {
  const ast = parseSync(content);
  traverse(ast, {
    ImportDeclaration(_path) {
      const { node } = _path;

      const libraryName = node.source.value;

      const _program = _path.findParent((p) => p.isProgram());

      if (
        node.specifiers.filter((v) => v.type === "ImportDefaultSpecifier")
          .length > 0
      ) {
        return;
      }

      node.specifiers.forEach((v) => {
        const name = v.imported?.name ?? "";

        _program.pushContainer(
          "body",
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(name))],
            t.stringLiteral(`${libraryName}/lib/${name}`)
          )
        );
      });

      _path.remove();
      _path.skip();
    },
  });

  const code = generator(ast)?.code;

  fs.writeFileSync(
    path.join(__dirname, "../../demo_transform_babel.txt"),
    code
  );
};

console.time("transform_babel");

console.timeLog("transform_babel");

const content = fs
  .readFileSync(path.join(__dirname, "../../demo.txt"))
  .toString();
transform(content);

console.timeEnd("transform_babel");
