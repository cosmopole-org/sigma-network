
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
            let { topic, member, targetMember } = packet;
            callback({
                packet: data,
                spaceId: topic.spaceId,
                topicId: topic.id,
                myMemberId: targetMember.id,
                userMemberId: member.id,
                answer: async (answerPacket: any) => {
                    answerPacket.tag = data.tag;
                    answerPacket.type = "response";
                    let res = await this.send({ spaceId: topic.spaceId, topicId: topic.id, memberId: targetMember.id, recvId: member.id, packet: answerPacket });
                    console.log(res);
                },
                broadcast: async (pushPacket: any) => {
                    pushPacket.type = "push";
                    let res = await this.sendToAll({ spaceId: topic.spaceId, topicId: topic.id, memberId: targetMember.id, packet: pushPacket });
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

    async sendToAll(data: { spaceId?: string, topicId?: string, memberId?: string, recvId?: string, packet: any }) {
        return this.network.safelyRequest(1, 'topics/send', 'POST', {
            type: "broadcast",
            spaceId: data.spaceId,
            topicId: data.topicId,
            memberId: data.memberId,
            data: JSON.stringify(data.packet)
        })
    }
}

export default MachineService
