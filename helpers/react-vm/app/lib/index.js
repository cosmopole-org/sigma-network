
import { evaluate, register_messaging, trigger } from './engine/index.js';

const render = (element) => {
  if (typeof element != "object") {
    return document.createTextNode(element.toString());
  }
  let rendered = document.createElement(element.tag);
  rendered.setAttribute("id", element.key);
  Object.entries(element.props).forEach(([name, value]) => {
    rendered.setAttribute(name, value);
  })
  Object.entries(element.events).forEach(([name, value]) => {
    if (("on" + name.toLowerCase()) in window) {
      rendered.addEventListener(
        name.toLowerCase(),
        () => {
          trigger(value)
        }
      );
    }
  })
  element.children.forEach(child => {
    rendered.appendChild(render(child));
  })
  return rendered;
}

let root = document.getElementById("root");

(async () => {
  register_messaging(msgStr => {
    let msg = JSON.parse(msgStr);
    switch (msg.action) {
      case "setTimeout": {
        setTimeout(() => trigger(msg.callbackId), msg.time);
        break;
      }
      case "init": {
        console.log(msg);
        root.appendChild(render(msg.element));
        break;
      }
      case "update": {
        console.log(msg);
        let rendered = render(msg.element);
        let old = document.getElementById(msg.element.key);
        console.log(old, rendered);
        old.replaceWith(rendered);
        break;
      }
      case "log": {
        console.log(msg);
        break;
      }
    }
  });
  evaluate(await (await fetch("/assets/build.js.txt")).text());
})();
