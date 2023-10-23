
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import BaseMachine from "src/machines/base.machine";

class CustomController extends BaseController {
    service: BaseMachine
    name: string
    constructor(name: string, service: BaseMachine) {
        super()
        this.name = name
        this.service = service
    }
    getName(): string { return this.name }
    async route(key: string, client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.route(key, client, body)
        response(result)
    }
}

export default CustomController
