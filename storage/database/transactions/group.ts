
import { Document } from 'database/schemas/document.schema';
import { Group } from 'database/schemas/group.schema';

const docIds = async (roomId: string) => {
  let group = await Group.findOne({ roomId: roomId }).lean().exec();
  if (group !== null) {
    return { success: true, docIds: group.docIds };
  } else {
    return { success: false };
  }
}

const docsByIds = async (docIds: Array<string>) => {
  let docs = await Document.find({ id: { $in: docIds } }).lean().exec();
  return { success: true, docs: docs };
}

export {
  docIds,
  docsByIds
}
