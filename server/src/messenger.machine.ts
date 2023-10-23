
import Action from "./machines/utils/action";
import BaseMachine from "./machines/base.machine";
import Client from "./drivers/network/client";

class MessengerMachine extends BaseMachine {
    getName = () => 'messenger'
    getService = () => {
        return {
            createTextMessage: new Action(
                {
                    authenticate: true,
                    authorize: true
                },
                (client: Client, body: any, guardianReport?: { towerId: string, permissions: { [id: string]: boolean } }) => {
                    return {
                        text: `hello human ${body.name}`
                    }
                }
            )
        }
    }
    getClient = () => 'native'
}

export default MessengerMachine
