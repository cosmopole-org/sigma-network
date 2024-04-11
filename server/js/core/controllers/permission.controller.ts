
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import PermissionService from "../services/permission.service";

class PermissionController extends BaseController {
    service: PermissionService
    constructor(service: PermissionService) {
        super()
        this.service = service
    }
    getName() { return 'permission' }
    async update(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.update(client, body, requestId)
        response(result)
    }
    async read(client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.read(client, body, requestId)
        response(result)
    }
}

export default PermissionController
