
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import RoomService from "src/services/room.service";

class RoomController extends BaseController {
    service: RoomService
    constructor(service: RoomService) {
        super()
        this.service = service
    }
    getName() { return 'room' }
    async create(client: Client, body: any, response: any) {
        let result = await this.service.create(client, body)
        response(result)
    }
    async remove(client: Client, body: any, response: any) {
        let result = await this.service.remove(client, body)
        response(result)
    }
    async search(client: Client, body: any, response: any) {
        let result = await this.service.search(client, body)
        response(result)
    }
    async readById(client: Client, body: any, response: any) {
        let result = await this.service.readById(client, body)
        response(result)
    }
}

export default RoomController
