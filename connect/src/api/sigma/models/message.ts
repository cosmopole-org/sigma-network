import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "message",
    "version": 0,
    "description": "",
    "primaryKey": "id",
    "type": "object",
    "properties": {
        "id": {
            "type": "string",
            "maxLength": 100
        },
        "authorId": {
            "type": "string"
        },
        "spaceId": {
            "type": "string"
        },
        "topicId": {
            "type": "string"
        },
        "time": {
            "type": "number"
        },
        "tag": {
            "type": "string"
        },
        "state": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string"
                }
            }
        },
    },
    "required": [
        "id",
        "time",
        "topicId",
        "spaceId",
        "authorId",
        "tag"
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const messageSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type MessageCollection = RxCollection<DocType, DocMethods, CollectionMethods>;
