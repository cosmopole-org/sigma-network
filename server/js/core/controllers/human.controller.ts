
import Client from "../drivers/network/client";
import HumanService from "../services/human.service";
import BaseController from "./base.controller";

class HumanController extends BaseController {
    service: HumanService
    constructor(service: HumanService) {
        super()
        this.service = service
    }
    getName(): string { return 'human' }
    async signUp(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.signUp(client, body, requestId)
        response(result)
    }
    async signIn(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.signIn(client, body, requestId)
        response(result)
    }
    async verify(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.verify(client, body, requestId)
        response(result)
    }
    async complete(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.complete(client, body, requestId)
        response(result)
    }
    async update(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.update(client, body, requestId)
        response(result)
    }
    async readById(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.readById(client, body, requestId)
        response(result)
    }
    async search(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.search(client, body, requestId)
        response(result)
    }
    async signOut(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.signOut(client, requestId)
        response(result)
    }
}

export default HumanController
