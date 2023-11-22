import mongoose, { Schema } from 'mongoose';
import IGroup from '../../models/group.model';

const GroupSchema = new Schema({
    roomId: String,
    docIds: [String]
})

let Group: mongoose.Model<IGroup>

const prepare = () => {
    Group = mongoose.model<IGroup>('Group', GroupSchema, 'Group');
}

export {
    prepare,
    GroupSchema,
    Group
}
