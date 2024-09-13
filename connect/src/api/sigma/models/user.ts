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
        "username": {
            "type": "string"
        },
        "name": {
            "type": "string"
        },
        "avatar": {
            "type": "string"
        },
        "publicKey": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "username",
        "secret",
        "name",
        "avatar",
        "publicKey"
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const userSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type UserCollection = RxCollection<DocType, DocMethods, CollectionMethods>;
