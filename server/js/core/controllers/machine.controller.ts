
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import MachineService from "services/machine.service";

class MachineController extends BaseController {
    service: MachineService
    constructor(service: MachineService) {
        super()
        this.service = service
    }
    getName() { return 'machine' }
    async create(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.create(client, body, requestId)
        response(result)
    }
    async update(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.update(client, body, requestId)
        response(result)
    }
    async remove(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.remove(client, body, requestId)
        response(result)
    }
    async search(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.search(client, body, requestId)
        response(result)
    }
    async read(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.read(client, body, requestId)
        response(result)
    }
    async signIn(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.signIn(client, body, requestId)
        response(result)
    }
}

export default MachineController
