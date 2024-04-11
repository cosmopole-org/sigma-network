import mongoose, { Schema } from 'mongoose';
import IDocument from 'models/document.model';

const DocumentSchema = new Schema({
    id: String,
    type: String,
    time: Number,
    isPublic: Boolean,
    previewId: String,
    secret: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed
})

let Document: mongoose.Model<IDocument>

const prepare = () => {
    Document = mongoose.model<IDocument>('Document', DocumentSchema, 'Document');
}

export {
    prepare,
    DocumentSchema,
    Document
}
