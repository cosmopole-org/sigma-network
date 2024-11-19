
import { NetworkDriver } from "api/drivers"

class MachineService {

    network: NetworkDriver
    memory: {
        myMachineId: any,
        spaces: any,
    }

    constructor(
        network: NetworkDriver,
        memory: {
            myMachineId: any,
            spaces: any
        }
    ) {
        this.network = network
        this.memory = memory
    }

    onRequest(callback: (data: any) => void) {
        this.network.addUpdateListener('topics/send', (packet: any) => {
            let data = JSON.parse(packet.data)
            callback({
                data: data,
                answer: async (answerPacket: any, otherTag?: string) => {
                    answerPacket.tag = data.tag;
                    let { space, topic, member, targetMember } = packet;
                    let res = await this.send({ spaceId: topic.spaceId, topicId: topic.id, memberId: targetMember.id, recvId: member.id, packet: answerPacket });
                    console.log(res);
                },
            })
        })
    }

    async send(data: { spaceId?: string, topicId?: string, memberId?: string, recvId?: string, packet: any }) {
        return this.network.safelyRequest(1, 'topics/send', 'POST', {
            type: "single",
            spaceId: data.spaceId,
            topicId: data.topicId,
            memberId: data.memberId,
            recvId: data.recvId,
            data: JSON.stringify(data.packet)
        })
    }
}

export default MachineService
