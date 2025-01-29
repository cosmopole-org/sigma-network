
import { getQuickJS } from "../node_modules/quickjs-emscripten";
import { Arena } from "../node_modules/quickjs-emscripten-sync";

class Cls {
  field = 0;

  method() {
    return ++this.field;
  }
}

const ctx = (await getQuickJS()).newContext();
const arena = new Arena(ctx, { isMarshalable: true });

// We can pass objects to the context and run code safely
const exposed = {
  Cls,
  cls: new Cls(),
  syncedCls: arena.sync(new Cls()),
};
arena.expose(exposed);

arena.evalCode(`cls instanceof Cls`); // returns true
arena.evalCode(`cls.field`);          // returns 0
arena.evalCode(`cls.method()`);       // returns 1
arena.evalCode(`cls.field`);          // returns 1

arena.evalCode(`syncedCls.field`);    // returns 0
exposed.syncedCls.method();           // returns 1
arena.evalCode(`syncedCls.field`);    // returns 1

arena.dispose();
ctx.dispose();
