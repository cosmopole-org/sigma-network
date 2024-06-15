
export let AppletWasm: any;

const instantiate = async (module: any, imports: any = {}) => {
    const adaptedImports = {
        env: Object.assign(Object.create(globalThis), imports.env || {}, {
            abort(message: any, fileName: any, lineNumber: any, columnNumber: any) {
                // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
                message = __liftString(message >>> 0);
                fileName = __liftString(fileName >>> 0);
                lineNumber = lineNumber >>> 0;
                columnNumber = columnNumber >>> 0;
                (() => {
                    // @external.js
                    throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
                })();
            },
            "output"(s: any) {
                // src/index/output(~lib/string/String) => void
                s = __liftString(s >>> 0);
                console.log(s);
            },
        }),
        wasi_snapshot_preview1: {}
    };
    const { exports } =  await WebAssembly.instantiate(module, adaptedImports) as any;

    const memory = exports.memory || imports.env.memory;
    function __liftString(pointer: any) {
        if (!pointer) return null;
        const
            end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
            memoryU16 = new Uint16Array(memory.buffer);
        let
            start = pointer >>> 1,
            string = "";
        while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
        return string + String.fromCharCode(...memoryU16.subarray(start, end));
    }
    return exports
}

const loadWasm = async (name: string) => {
    return await instantiate(await globalThis.WebAssembly.compileStreaming(globalThis.fetch(`/libs/${name}/${name}.wasm`)));
}

export const importLibs = async () => {
    AppletWasm = await loadWasm("applet");
}
