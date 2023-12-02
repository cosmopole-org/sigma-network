import * as mongoose from 'mongoose';
import mongoose__default from 'mongoose';

interface IPreview {
    id: string;
}

interface IDocument {
    id: string;
    type: string;
    time: number;
    isPublic: boolean;
    previewId: string;
    secret: {
        uploaderId: string;
        roomIds: Array<string>;
    };
    metadata: {
        duration: number;
        width: number;
        height: number;
        extension: string;
        title: string;
        size: number;
    };
}

declare const finalup: (path: string, roomId: string, humanId: string, isPublic: boolean, extension: string, type: string, title: string) => Promise<{
    success: boolean;
    document: mongoose__default.Document<unknown, any, IDocument> & Omit<IDocument & {
        _id: mongoose__default.Types.ObjectId;
    }, never>;
    preview: mongoose__default.Document<unknown, any, IPreview> & Omit<IPreview & {
        _id: mongoose__default.Types.ObjectId;
    }, never>;
}>;

declare const upload_finalup: typeof finalup;
declare namespace upload {
  export {
    upload_finalup as finalup,
  };
}

declare const document: (documentId: string, roomId: string, range: any, res: any, onEnd?: () => void) => Promise<{
    success: boolean;
}>;
declare const preview: (documentId: string, roomId: string, res: any) => Promise<{
    success: boolean;
}>;
declare const waveform: (documentId: string, roomId: string, res: any) => Promise<{
    success: boolean;
}>;

declare const download_document: typeof document;
declare const download_preview: typeof preview;
declare const download_waveform: typeof waveform;
declare namespace download {
  export {
    download_document as document,
    download_preview as preview,
    download_waveform as waveform,
  };
}

declare const docIds: (roomId: string) => Promise<{
    success: boolean;
    docIds: string[];
} | {
    success: boolean;
    docIds?: undefined;
}>;
declare const docsByIds: (docIds: Array<string>) => Promise<{
    success: boolean;
    docs: any[];
}>;
declare const docById: (docId: string) => Promise<{
    success: boolean;
    doc: {
        preview: mongoose.Document<unknown, any, IPreview> & Omit<IPreview & {
            _id: mongoose.Types.ObjectId;
        }, never>;
        id: string;
        _id: mongoose.Types.ObjectId;
        type: string;
        time: number;
        isPublic: boolean;
        previewId: string;
        secret: {
            uploaderId: string;
            roomIds: string[];
        };
        metadata: {
            duration: number;
            width: number;
            height: number;
            extension: string;
            title: string;
            size: number;
        };
    };
} | {
    success: boolean;
    doc?: undefined;
}>;
declare const removeDoc: (docId: string) => Promise<{
    success: boolean;
}>;
declare const updateDoc: (docId: string, data: {
    title: string;
}) => Promise<{
    success: boolean;
    doc: mongoose.LeanDocument<IDocument & {
        _id: mongoose.Types.ObjectId;
    }>;
} | {
    success: boolean;
    doc?: undefined;
}>;

declare const group_docById: typeof docById;
declare const group_docIds: typeof docIds;
declare const group_docsByIds: typeof docsByIds;
declare const group_removeDoc: typeof removeDoc;
declare const group_updateDoc: typeof updateDoc;
declare namespace group {
  export {
    group_docById as docById,
    group_docIds as docIds,
    group_docsByIds as docsByIds,
    group_removeDoc as removeDoc,
    group_updateDoc as updateDoc,
  };
}

declare class SigmaStorage {
    constructor(config: any);
    start(): Promise<void>;
    uploader: typeof upload;
    downloader: typeof download;
    group: typeof group;
}

export { SigmaStorage as default };
