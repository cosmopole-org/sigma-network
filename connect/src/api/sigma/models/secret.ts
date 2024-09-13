import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "user",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "privateKey": {
            "type": "string"
        },
        "publicKey": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "privateKey",
        "publicKey"
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const secretSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type SecretCollection = RxCollection<DocType, DocMethods, CollectionMethods>;
