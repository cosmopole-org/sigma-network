
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
import config from '../../config';
import cors from 'cors';
import * as Factories from '../../database/factories';
import { IHuman } from "models/human.model";

class NetworkDriver {
    static _instance: NetworkDriver
    static get instance() { return NetworkDriver._instance }
    static initialize(callback: any) {
        return new NetworkDriver(callback)
    }
    app: Express
    server: HttpServer
    io: Server
    controllers: { [id: string]: BaseController } = {}
    services: { [id: string]: BaseService } = {}
    clients: { [id: string]: Client } = {}
    restSessions: { [id: string]: Client } = {}
    lastSeens: { [id: string]: number } = {}
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
    public keepClient(token: string, client: Client) {
        this.clients[client.humanId] = client
        this.restSessions[token] = client
    }
    public looseClient(client: Client) {
        client.token && (delete this.restSessions[client.token])
        client.humanId && (delete this.clients[client.humanId])
    }
    public registerController<T extends BaseController, V extends BaseService>(type: { new(...args: any[]): T; }, type2: { new(...args: any[]): V; }, meta?: any) {
        let service = meta ? new type2(meta) : new type2()
        let controller = new type(service)
        this.services[controller.getName()] = service
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
            controller.route(parts.slice(1), client, body, requestId, callback).catch((ex: any) => console.log(ex))
        } else {
            controller[parts[1]](client, body, requestId, callback).catch((ex: any) => console.log(ex))
        }
    }
    private routeRest(client: Client, path: string, req: express.Request, res: express.Response) {
        console.log(path)
        let parts = path.split('/')
        let controller = this.controllers[parts[0]]
        if (controller instanceof CustomController) {
            controller.routeRest(parts.slice(1), client, req, res).catch((ex: any) => console.log(ex))
            return true
        } else {
            return false
        }
    }
    constructor(callback) {
        NetworkDriver._instance = this
        Factories.HumanFactory.instance.read().then((humans: Array<IHuman>) => {
            humans.forEach(human => {
                this.lastSeens[human.id] = human.secret.lastSeen
            })
            this.app = express()
            this.app.use(cors())
            this.app.use(express.urlencoded({ extended: true }))
            this.app.use(express.json())
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
                socket.on('disconnect', async () => {
                    console.log('client disconnected');
                    delete this.clients[client.humanId]
                    let humanId = client.humanId
                    if (humanId) {
                        let controller: HumanController = this.controllers['human'] as HumanController
                        let result = await controller.service.signOut(client, 'EMPTY')
                        if (result.success) {
                            this.lastSeens[humanId] = result.lastSeen
                        }
                    }
                });
                socket.onAny((...args) => {
                    this.route(client, args[0], args[1], args[2], args[3]);
                })
            });
            this.app.all('*', (req: express.Request, res: express.Response, next: any) => {
                if (!this.routeRest(this.restSessions[req.headers['token']?.toString()], req.path.substring(1), req, res)) {
                    next();
                }
            })
            callback()
        })
    }
}

export default NetworkDriver
