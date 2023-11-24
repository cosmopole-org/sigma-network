
import { Server, Socket } from "socket.io";
import express from 'express';
import { Request, Response, Express } from "express"
import { createServer, Server as HttpServer } from 'node:http';
import "reflect-metadata";
import BaseController from "../../controllers/base.controller";
import BaseService from "../../services/base.service";
import Client from "./client";
import { createAdapter } from "@socket.io/redis-adapter";
import MemoryDriver from "../memory/memory";
import { Emitter } from "@socket.io/redis-emitter";
import * as json from '../../utils/json'
import HumanController from "../../controllers/human.controller";
import CustomController from "../../controllers/custom.controller";
import config from '../../config'
import cors from 'cors'

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
    clients: { [id: string]: Client } = {}
    private emitter: Emitter
    public group(towerId: string) {
        return {
            emit: (packet: any) => {
                this.io.to(towerId).emit('update', JSON.parse(json.safeStringify(packet)))
            },
            boradcast: {
                emit: (client: Client, packet: any) => {
                    client.socket.broadcast.to(towerId).emit('update', JSON.parse(json.safeStringify(packet)))
                }
            }
        }
    }
    public keepClient(client: Client) {
        this.clients[client.humanId] = client
    }
    public looseClient(client: Client) {
        client.humanId && (delete this.clients[client.humanId])
    }
    public registerController<T extends BaseController, V extends BaseService>(type: { new(...args: any[]): T; }, type2: { new(...args: any[]): V; }, meta?: any) {
        let controller = new type(meta ? new type2(meta) : new type2())
        this.controllers[controller.getName()] = controller
    }
    public registerCustomController(controller: CustomController) {
        this.controllers[controller.getName()] = controller
    }
    private creaateWelcomeRoute() {
        this.app.get('/', (req: Request, res: Response) => {
            res.send('<h1>Welcome to Sigma !</h1>')
        })
    }
    private startExpressServer() {
        this.server.listen(config['SOCKET_PORT'], () => {
            console.log(`server running at http://localhost:${config['SOCKET_PORT']}`)
        })
    }
    private route(client: Client, path: string, body: any, requestId: string, callback: any) {
        let parts = path.split('/')
        let controller = this.controllers[parts[0]]
        if (controller instanceof CustomController) {
            controller.route(parts.slice(1), client, body, requestId, callback)
        } else {
            controller[parts[1]](client, body, requestId, callback)
        }
    }
    constructor() {
        NetworkDriver._instance = this
        this.app = express()
        this.app.use(cors())
        this.server = createServer(this.app)
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
            },
            maxHttpBufferSize: 1e8
        })
        let subClient = MemoryDriver.instance.redisClient.duplicate()
        this.io.adapter(createAdapter(MemoryDriver.instance.redisClient, subClient));
        this.emitter = new Emitter(MemoryDriver.instance.redisClient);
        this.creaateWelcomeRoute()
        this.startExpressServer()
        this.io.on('connection', (socket: Socket) => {
            console.log('a client connected');
            let client = new Client(socket, this.emitter)
            socket.on('disconnect', () => {
                console.log('client disconnected');
                delete this.clients[client.humanId]
                let controller: HumanController = this.controllers['human'] as HumanController
                controller.service.signOut(client, 'EMPTY')
            });
            socket.onAny((...args) => {
                this.route(client, args[0], args[1], args[2], args[3]);
            })
        });
    }
}

export default NetworkDriver
