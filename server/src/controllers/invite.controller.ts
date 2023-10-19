
import InviteService from "src/services/invite.service";
import Client from "../drivers/network/client";
import BaseController from "./base.controller";

class InviteController extends BaseController {
    service: InviteService
    constructor(service: InviteService) {
        super()
        this.service = service
    }
    getName() { return 'invite' }
    async create(client: Client, body: any, response: any) {
        let result = await this.service.create(client, body)
        response(result)
    }
    async cancel(client: Client, body: any, response: any) {
        let result = await this.service.cancel(client, body)
        response(result)
    }
    async accept(client: Client, body: any, response: any) {
        let result = await this.service.accept(client, body)
        response(result)
    }
    async decline(client: Client, body: any, response: any) {
        let result = await this.service.decline(client, body)
        response(result)
    }
}

export default InviteController
