
import { Document } from 'database/schemas/document.schema';
import { Group } from 'database/schemas/group.schema';
import { Preview } from 'database/schemas/preview.schema';

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
  let previewsDict = {};
  (await Preview.find({ id: { $in: docs.map(d => d.previewId) } })).forEach(p => (previewsDict[p.id] = []))
  let result = []
  docs.forEach(d => {
    result.push({ ...d, preview: previewsDict[d.previewId] })
  })
  return { success: true, docs: result };
}

const docById = async (docId: string) => {
  let doc = await Document.findOne({ id: docId }).lean().exec();
  if (doc !== null) {
    return { success: true, doc: { ...doc, preview: await Preview.findOne({ id: doc.previewId }) } };
  } else {
    return { success: false }
  }
}

const removeDoc = async (docId: string) => {
  let doc = await Document.findOneAndDelete({ id: docId });
  return { success: doc !== null };
}

const updateDoc = async (docId: string, data: { title: string }) => {
  let doc = await Document.findOneAndUpdate({ id: docId }, { $set: { 'metadata.title': data.title } }, { new: true }).lean();
  return doc ? { success: true, doc } : { success: false };
}

export {
  docIds,
  docsByIds,
  docById,
  removeDoc,
  updateDoc
}
