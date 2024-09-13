import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "space",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "title": {
            "type": "string"
        },
        "avatar": {
            "type": "string"
        },
        "tag": {
            "type": "string"
        },
        "isPublic": {
            "type": "boolean"
        }
    },
    "required": [
        "id",
        "title",
        "avatar",
        "tag",
        "isPublic",
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const spaceSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type SpaceCollection = RxCollection<DocType, DocMethods, CollectionMethods>;
