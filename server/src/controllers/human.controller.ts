
import Client from "../drivers/network/client";
import UserService from "../services/human.service";
import BaseController from "./base.controller";

class HumanController extends BaseController {
    service: UserService
    constructor(service: UserService) {
        super()
        this.service = service
    }
    getName() { return 'human' }
    async signUp(client: Client, body: any, response: any) {
        let result = await this.service.signUp(client, body)
        response(result)
    }
    async signIn(client: Client, body: any, response: any) {
        let result = await this.service.signIn(client, body)
        response(result)
    }
    async verify(client: Client, body: any, response: any) {
        let result = await this.service.verify(client, body)
        response(result)
    }
    async complete(client: Client, body: any, response: any) {
        let result = await this.service.complete(client, body)
        response(result)
    }
    async readById(client: Client, body: any, response: any) {
        let result = await this.service.readById(client, body)
        response(result)
    }
}

export default HumanController
