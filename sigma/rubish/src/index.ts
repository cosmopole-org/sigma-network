
import Applet, { Runnable } from './widget/Applet'
import Utils from './widget/utils'
import Controls from './widget/controls'
import Native from './native'

export default function run(name: string, entry: string, code: string) {
    let applet = new Applet(name);
    applet.fill(code);
    applet.setContextBuilder((mod) => ({ ...globalThis, ...new Native(globalThis, mod, Controls)}) as any);
    applet.run(entry, (key: string, u: any) => {
        globalThis.output(key, u);
    }).then((runnable: Runnable) => {
        globalThis.output(Utils.json.prettify(runnable.root))
        runnable.mount()
    })
}
