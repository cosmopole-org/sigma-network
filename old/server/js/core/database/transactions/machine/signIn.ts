
import { ClientSession } from 'mongoose';
import * as Factories from '../../factories'

const signIn = async (args: { machineId: string }, _session?: ClientSession) => {
  let workerships = await Factories.WorkerFactory.instance.read({ machineId: args.machineId })
  let rooms = await Factories.RoomFactory.instance.findGroup({ id: { $in: workerships.map(w => w.roomId) } })
  let towerIds = (await Factories.TowerFactory.instance.findGroup({ id: { $in: rooms.map(r => r.towerId) } })).map(t => t.id)
  return { success: true, towerIds };
}

export default signIn
