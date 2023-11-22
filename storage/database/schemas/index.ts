
import * as DocumentSchema from "./document.schema"
import * as GroupSchema from "./group.schema"
import * as PreviewSchema from './preview.schema'

const build = () => {
    DocumentSchema.prepare()
    PreviewSchema.prepare()
    GroupSchema.prepare()
}

export {
    build,
    DocumentSchema,
    PreviewSchema
}
