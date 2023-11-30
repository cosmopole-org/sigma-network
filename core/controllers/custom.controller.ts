
import Client from "../drivers/network/client";
import BaseController from "./base.controller";
import BaseMachine from "machines/base.machine";
import express from 'express'

class CustomController extends BaseController {
    service: BaseMachine
    name: string
    constructor(name: string, service: BaseMachine) {
        super()
        this.name = name
        this.service = service
    }
    getName(): string { return this.name }
    async route(key: Array<string>, client: Client, body: any, requestId: string, response: any) {
        let result = await this.service.route(key, client, body)
        response(result)
    }
    async routeRest(key: Array<string>, client: Client, req: express.Request, res: express.Response) {
        await this.service.routeRest(key, client, req, res)
    }
}

export default CustomController
