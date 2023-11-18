
import mongoose, { ClientSession } from 'mongoose';
import * as Factories from '../../factories'
import { ITower } from 'models/tower.model';

const read = async (args: { humanId: string }, _session?: ClientSession) => {
  try {
    let invites = await Factories.InviteFactory.instance.read({ humanId: args.humanId })
    let towers = await Factories.TowerFactory.instance.findGroup({ id: { $in: invites.map(i => i.towerId) } })
    let towersDict = {}
    towers.forEach((tower: ITower) => {
      towersDict[tower.id] = tower
    });
    let finalResult = invites.map(invite => ({ ...invite, tower: towersDict[invite.towerId] }))
    return { success: true, invites: finalResult }
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export default read
