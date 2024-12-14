import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "interaction",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "userId": {
            "type": "string"
        },
        "state": {
            "type": "object"
        }
    },
    "required": [
        "id",
        "userId",
        "state"
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const interactionSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type InteractionCollection = RxCollection<DocType, DocMethods, CollectionMethods>;