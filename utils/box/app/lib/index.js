
import { evaluate, register_messaging, trigger } from './engine/index.js';

class Dom {

  root;

  update(updates) {
    updates.forEach((u) => {
      if (u.__action__ === 'raw_updated') {
        document.getElementById(u.__parentKey__).innerHTML = u.__element__;
      } else if (u.__action__ === 'element_deleted') {
        document.getElementById(u.__key__).remove();
      } else if (u.__action__ === 'element_created') {
        if (u.__parentKey__ === "root") {
          this.root.childNodes[0].appendChild(render(u.__element__));
        } else {
          document.getElementById(u.__parentKey__).appendChild(render(u.__element__));
        }
      } else if (u.__action__ === 'props_updated') {
        let el = document.getElementById(u.__key__);
        Object.keys(u.__updated__).forEach(propKey => {
          el.setAttribute(propKey, u.__updated__[propKey])
        });
      } else if (u.__action__ === 'events_updated') {
        let el = document.getElementById(u.__key__);
        Object.keys(u.__updated__).forEach(propKey => {
          if (("on" + propKey.toLowerCase()) in window) {
            el.addEventListener(
              propKey.toLowerCase(),
              () => {
                trigger(value)
              }
            );
          }
        });
      }
      //  else if (u.__action__ === 'styles_updated') {
      //   Object.keys(u.__updated__).forEach(styleKey => {
      //     that.uiBuilder.updateStyle(u.__key__, styleKey, u.__updated__[styleKey])
      //   })
      // }
    });
  }

  fill(element) {
    this.root.appendChild(render(element));
  }

  constructor(container) {
    this.root = container
  }
}

const render = (element) => {
  if (typeof element != "object") {
    return document.createTextNode(element.toString());
  }
  let rendered = document.createElement(element.tagName);
  rendered.setAttribute("id", element.key);
  Object.entries(element.props).forEach(([name, value]) => {
    if (name.toLowerCase().startsWith("on") && (name.toLowerCase() in window)) {
      rendered.addEventListener(
        name.toLowerCase().substring(2),
        () => {
          trigger(value)
        }
      );
    } else {
      rendered.setAttribute(name, value);
    }
  })
  element.children.forEach(child => {
    rendered.appendChild(render(child));
  })
  return rendered;
}

(async () => {

  let dom = new Dom(document.getElementById("root"));

  register_messaging(msgStr => {
    let msg = JSON.parse(msgStr);
    switch (msg.action) {
      case "setTimeout": {
        setTimeout(() => trigger(msg.callbackId), msg.time);
        break;
      }
      case "init": {
        console.log(msg);
        dom.fill(msg.element);
        break;
      }
      case "update": {
        console.log(msg);
        dom.update(msg.element);
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
