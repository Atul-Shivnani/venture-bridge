const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swagger.json'));

// Remove x-alternatives from all parameters in all paths
for (const path of Object.values(swagger.paths)) {
  for (const op of Object.values(path)) {
    if (op.parameters) {
      op.parameters = op.parameters.map(p => {
        delete p['x-alternatives'];
        return p;
      });
    }
  }
}

fs.writeFileSync('swagger_clean.json', JSON.stringify(swagger, null, 2));