import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "session",
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
        "token": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "userId",
        "token",
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const sessionSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type SessionCollection = RxCollection<DocType, DocMethods, CollectionMethods>;