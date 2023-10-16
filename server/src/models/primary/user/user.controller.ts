
import Client from "../../../network/client";
import UserService from "../../../services/human.service";
import BaseController from "../../base/base.controller";

class UserController extends BaseController {
    service: UserService
    constructor(service: UserService) {
        super()
        this.service = service
    }
    getName() { return 'user' }
    signUp(client: Client, body: any, response: any) {
        let result = this.service.signUp(client, body)
        response(result)
    }
    signIn(client: Client, body: any, response: any) {
        let result = this.service.signUp(client, body)
        response(result)
    }
}

export default UserController
