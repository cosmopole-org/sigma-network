import jsx from 'jsx-transform'
import MagicString from 'magic-string'
import { createFilter } from 'rollup-pluginutils'

export default (options = {
  factory: 'React.createElement',
  passUnknownTagsToFactory: true
}) => {
  const filter = createFilter(options.include, options.exclude)
  return {
    transform: function sourceToCode(code, id) {
      if (!filter(id)) return null

      const s = new MagicString(code)
      const out = jsx.fromString(code, options)
      s.overwrite(0, code.length, out.toString())

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}
