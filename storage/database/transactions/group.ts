
import { Group } from 'database/schemas/group.schema';

const docIds = async (roomId: string) => {
  let group = await Group.findOne({ roomId: roomId }).lean().exec();
  if (group !== null) {
    return { success: true, docIds: group.docIds };
  } else {
    return { success: false };
  }
}

export {
  docIds
}
