import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgPath = path.join(__dirname, '../package.json');

let data = fs.readFileSync(pkgPath);
let obj = JSON.parse(data);

let extra = {
    "@babel/preset-env": "^7.26.7",
    "@babel/preset-react": "^7.26.3",
    "@rollup/plugin-commonjs": "^28.0.2",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "babel-plugin-transform-es2015-spread": "^6.22.0",
    "react-reconciler": "^0.29.0",
    "rollup-plugin-delete": "^2.1.0",
    "rollup-plugin-esbuild": "^6.1.1",
    "rollup-plugin-peer-deps-external": "^2.2.4",
    "rollup-plugin-terser": "^7.0.2"
};

obj.dependencies = {
    ...obj.dependencies,
    ...extra
};

extra = {
    "@rollup/plugin-babel": "^6.0.4",
    "babel-plugin-transform-object-rest-spread": "^6.26.0",
    "jsx-transform": "^2.4.0",
    "magic-string": "^0.25.4",
    "rollup": "^2.0.0",
    "rollup-plugin-commonjs": "^10.1.0",
    "rollup-plugin-node-resolve": "^5.2.0",
    "rollup-pluginutils": "^2.8.2"
};

obj.devDependencies = {
    ...obj.devDependencies,
    ...extra
};

data = JSON.stringify(obj);

fs.renameSync(pkgPath, path.join(__dirname, '../package.old.json'));
fs.writeFileSync(pkgPath, data, { encoding: 'utf8' });

