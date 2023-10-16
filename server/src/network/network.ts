
import { Server, Socket } from "socket.io";
import * as express from 'express';
import { Request, Response, Express } from "express"
import { createServer, Server as HttpServer } from 'node:http';
import "reflect-metadata";
import BaseController from "src/models/base/base.controller";
import BaseService from "src/models/base/base.service";
import Client from "./client";

class NetworkDriver {
    static _instance: NetworkDriver
    static get instance() { return NetworkDriver._instance }
    static initialize() {
        return new NetworkDriver()
    }
    app: Express
    server: HttpServer
    io: Server
    controllers: { [id: string]: BaseController } = {}
    clients : { [id: string]: Client } = {}
    public registerController<T extends BaseController, V extends BaseService>(type: { new(...args : any[]): T ;}, type2: { new(...args : any[]): V ;} ): NetworkDriver {
        let controller = new type(new type2())
        this.controllers[controller.getName()] = controller
        return this
    }
    private creaateWelcomeRoute() {
        this.app.get('/', (req: Request, res: Response) => {
            res.send('<h1>Welcome to Sigma !</h1>')
        })
    }
    private startExpressServer() {
        this.server.listen(3000, () => {
            console.log('server running at http://localhost:3000')
        })
    }
    private route(client: Client, path: string, body: any, callback: any) {
        let parts = path.split('/')
        this.controllers[parts[0]][parts[1]](client, body, callback)
    }
    constructor() {
        NetworkDriver._instance = this
        this.app = express()
        this.server = createServer(this.app)
        this.io = new Server(this.server)
        this.creaateWelcomeRoute()
        this.startExpressServer()
        this.io.on('connection', (socket: Socket) => {
            console.log('a client connected');
            socket.on('disconnect', () => {
                console.log('client disconnected');
            });
            let client = new Client(socket)
            socket.onAny((...args) => {
                this.route(client, args[0], args[1], args[2]);
            })
        });
    }
}

export default NetworkDriver
