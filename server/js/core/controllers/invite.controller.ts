
import InviteService from "services/invite.service";
import Client from "../drivers/network/client";
import BaseController from "./base.controller";

class InviteController extends BaseController {
    service: InviteService
    constructor(service: InviteService) {
        super()
        this.service = service
    }
    getName() { return 'invite' }
    async create(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.create(client, body, requestId)
        response(result)
    }
    async cancel(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.cancel(client, body, requestId)
        response(result)
    }
    async accept(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.accept(client, body, requestId)
        response(result)
    }
    async decline(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.decline(client, body, requestId)
        response(result)
    }
    async read(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.read(client, body, requestId)
        response(result)
    }
}

export default InviteController
