
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import RoomService from "services/room.service";

class RoomController extends BaseController {
    service: RoomService
    constructor(service: RoomService) {
        super()
        this.service = service
    }
    getName() { return 'room' }
    async create(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.create(client, body, requestId)
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
    async readById(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.readById(client, body, requestId)
        response(result)
    }
    async update(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.update(client, body, requestId)
        response(result)
    }
}

export default RoomController
