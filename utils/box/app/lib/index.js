
import { evaluate, register_messaging, trigger } from './engine/index.js';

const findScopeEl = (root, scope) => {
  let scopeEl = root;
  let pathParts = scope.substring(1).split("/");
  let counter = 0;
  while (pathParts[counter].substring(0, 1).toUpperCase() === pathParts[counter].substring(0, 1)) {
    counter++;
  }
  counter++;
  for (let i = counter; i < pathParts.length; i++) {
    let part = pathParts[i];
    console.log(part);
    console.log(scopeEl);
    if (part.substring(0, 1).toUpperCase() !== part.substring(0, 1)) {
      scopeEl = scopeEl.childNodes[Number(part.split(":")[1])];
    } else {
      let number = Number(part.split(":")[1]);
      let nextPart = pathParts[i + 1];
      while (nextPart !== undefined && nextPart.substring(0, 1).toUpperCase() === nextPart.substring(0, 1)) {
        i++;
        nextPart = pathParts[i];
      }
      i++;
      scopeEl = scopeEl.childNodes[number];
    }
  }
  return scopeEl;
}

class Dom {

  root;

  update(updates) {
    updates.forEach((u) => {
      console.log(u);
      if (u.__action__ === 'raw_updated') {
        let el = findScopeEl(this.root, u.path).querySelector("#" + u.__parentKey__);
        el.innerHTML = u.__element__;
        console.log("updated raw:", el);
      } else if (u.__action__ === 'element_deleted') {
        findScopeEl(this.root, u.path).querySelector("#" + u.__key__).remove();
      } else if (u.__action__ === 'element_created') {
        console.log(u);
        if (u.__parentKey__ === "root") {
          this.root.childNodes[0].appendChild(render(u.__element__));
        } else {
          let parent = findScopeEl(this.root, u.path);
          let childRendered = render(u.__element__)
          console.log(parent, childRendered);
          parent.appendChild(childRendered);
        }
      } else if (u.__action__ === 'props_updated') {
        console.log("updating props...");
        try {
          console.log(findScopeEl(this.root, u.path), u.__key__);
          let el = findScopeEl(this.root, u.path).querySelector("#" + u.__key__);
          console.log("updating props:", el);
          Object.keys(u.__updated__).forEach(propKey => {
            el.setAttribute(propKey, u.__updated__[propKey])
          });
          console.log("updated props:", el);
        } catch (ex) { console.log(ex) }
      } else if (u.__action__ === 'events_updated') {
        let el = findScopeEl(this.root, u.path).querySelector("#" + u.__key__);
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
        dom.update(msg.element.updates);
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
