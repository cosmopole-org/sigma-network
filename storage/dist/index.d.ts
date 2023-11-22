import mongoose from 'mongoose';

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
        size: number;
    };
}

declare const finalup: (path: string, roomId: string, humanId: string, isPublic: boolean, extension: string, type: string) => Promise<{
    success: boolean;
    document: mongoose.Document<unknown, any, IDocument> & Omit<IDocument & {
        _id: mongoose.Types.ObjectId;
    }, never>;
    preview: mongoose.Document<unknown, any, IPreview> & Omit<IPreview & {
        _id: mongoose.Types.ObjectId;
    }, never>;
}>;

declare const upload_finalup: typeof finalup;
declare namespace upload {
  export {
    upload_finalup as finalup,
  };
}

declare const document: (documentId: string, roomId: string, res: any) => Promise<{
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

declare const group_docIds: typeof docIds;
declare namespace group {
  export {
    group_docIds as docIds,
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
