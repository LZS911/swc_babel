const fs = require("fs");
const path = require("path");

let content = "";
for (let i = 0; i < 10000; ++i) {
  content += `import {A${i}, B${i}, C${i}} from 'custom-component';\n`;
}

fs.writeFileSync(path.join(__dirname, "./demo.txt"), content);
