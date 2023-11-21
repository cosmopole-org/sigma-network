import mongoose, { Schema } from 'mongoose';
import IPreview from 'models/preview.model';

const PreviewSchema = new Schema({
    id: String
})

let Preview: mongoose.Model<IPreview>

const prepare = () => {
     Preview = mongoose.model<IPreview>('Preview', PreviewSchema, 'Preview');
}

export {
    prepare,
    PreviewSchema,
    Preview    
}
