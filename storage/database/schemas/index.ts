
import * as DocumentSchema from "./document.schema"
import * as PreviewSchema from './preview.schema'

const build = () => {
    DocumentSchema.prepare()
    PreviewSchema.prepare()
}

export {
    build,
    DocumentSchema,
    PreviewSchema
}
