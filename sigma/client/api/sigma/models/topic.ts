import {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDocument,
    RxJsonSchema,
    toTypedRxJsonSchema
} from "rxdb";

const schema = {
    "title": "topic",
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
        "spaceId": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "title",
        "avatar",
        "spaceId",
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(schema);

export type DocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

export const topicSchema: RxJsonSchema<DocType> = schema;

export type DocMethods = {};

export type Document = RxDocument<DocType, DocMethods>;

export type CollectionMethods = {};

export type TopicCollection = RxCollection<DocType, DocMethods, CollectionMethods>;
