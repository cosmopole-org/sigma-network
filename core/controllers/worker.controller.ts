
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import WorkerService from "../services/worker.service";

class WorkerController extends BaseController {
    service: WorkerService
    constructor(service: WorkerService) {
        super()
        this.service = service
    }
    getName() { return 'worker' }
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
    async use(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.use(client, body, requestId)
        response(result)
    }
    async deliver(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.deliver(client, body, requestId)
        response(result)
    }
    async read(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.read(client, body, requestId)
        response(result)
    }
}

export default WorkerController
