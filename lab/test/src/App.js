import logo from './logo.svg';
import './App.css';
import { parse } from 'acorn';
import { generate } from 'astring'
import React from 'react';

let checker = {
  "type": "ExpressionStatement",
  "start": 85,
  "end": 100,
  "expression": {
    "type": "CallExpression",
    "start": 85,
    "end": 99,
    "callee": {
      "type": "Identifier",
      "start": 93,
      "end": 96,
      "name": "_kasperOsControlCheck"
    },
    "arguments": []
  }
}

let manipulate = (node) => {
  if (node) {
    for (let prop in node) {
      if (typeof node[prop] === 'object' && typeof node[prop] !== 'string')
        manipulate(node[prop]);
    }
    if (node.body && Array.isArray(node.body) && node.type !== 'ClassBody') {
      let mb = [];
      mb.push(checker);
      node.body.forEach(exp => {
        mb.push(exp);
        mb.push(checker);
      })
      node.body = mb;
    }
  }
}

let loaded = false;

function App() {
  React.useEffect(() => {
    if (!loaded) {
      (async () => {
        loaded = true;
        let code = await (await fetch('/index.js')).text();
        if (code.includes('_kasperOsControlCheck')) {
          throw new Error('attack !');
        }
        var ast = parse(code);
        console.log(JSON.stringify(ast));
        console.log(ast);
        manipulate(ast);
        console.log(ast);
        var formattedCode = generate(ast);
        console.log(formattedCode);
        parse(formattedCode)
        let evalSafe = global.eval;
        global.eval = () => { }

        window.addEventListener('error', function (e) {
          console.log(e.message
            , '\n', e.filename, ':', e.lineno, (e.colno ? ':' + e.colno : '')
            , e.error && e.error.stack ? '\n' : '', e.error ? e.error.stack : undefined
          );
        }, false);

        evalSafe(`
        (async () => { 
            const _kasperOsControlCheck = () => {
              _kasperOsControlCheck.instCount++;
              // if (_kasperOsControlCheck.instCount > 10000) {
              //   parent.removeTheApp();
              // }
            }
            _kasperOsControlCheck.instCount = 1;
            ${formattedCode}
        })()
      `);
      })();
    }
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
