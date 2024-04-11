
import TowerService from "../services/tower.service";
import Client from "../drivers/network/client";
import BaseController from "./base.controller";

class TowerController extends BaseController {
    service: TowerService
    constructor(service: TowerService) {
        super()
        this.service = service
    }
    getName() { return 'tower' }
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
    async join(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.join(client, body, requestId)
        response(result)
    }
    async readById(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.readById(client, body, requestId)
        response(result)
    }
    async readMembers(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.readMembers(client, body, requestId)
        response(result)
    }
    async read(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.read(client, body, requestId)
        response(result)
    }
}

export default TowerController
