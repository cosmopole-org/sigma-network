import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "member",
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
        "spaceId": {
            "type": "string"
        },
        "topicId": {
            "type": "string"
        },
        "metadata": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "userId",
        "spaceId",
        "topicId",
        "metadata"
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const memberSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type MemberCollection = RxCollection<DocType, DocMethods, CollectionMethods>;