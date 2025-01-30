
cp -f -r ../lib ./lib
cp lib/renderer.js src/renderer.js
cp lib/essentials.js src/essentials.js
node lib/packages-adder.js
npm install
rollup -c lib/rollup.config.js
rm package.json
mv package.old.json package.json
rm src/renderer.js
rm src/essentials.js
rm -r lib
cp -f dist/app.js ../../quickjsc/public/app.js
