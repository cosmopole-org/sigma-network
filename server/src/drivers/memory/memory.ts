
import express from 'express'
import * as redis from 'redis';
import config from '../../config.json';
import session from 'express-session';
import bodyParser from 'body-parser';
import SessionFactory from '../../database/factories/session.factory';
import MemberFactory from '../../database/factories/member.factory';
import cors from "cors";
import { ISession } from '../../models/session.model'
import RedisStore from "connect-redis"

class MemoryDriver {
    static _instance: MemoryDriver;
    static initialize(): MemoryDriver {
        return new MemoryDriver();
    }
    static get instance(): MemoryDriver {
        return MemoryDriver._instance;
    }
    redisClient: redis.RedisClientType;
    async save(key: string, value: any) {
        await this.redisClient.set(key, JSON.stringify(value));
    }
    fetch(key: string) {
        return new Promise(resolve => {
            this.redisClient.get(key).then(function (obj) {
                if (!obj) {
                    console.log('key not found');
                    resolve(undefined);
                    return;
                }
                resolve(obj);
            });
        })
    }
    loadAuthIntoMemory() {
        SessionFactory.instance.read().then((ss: Array<ISession>) => {
            ss.forEach(s => {
                this.save(`auth:${s.token}`, s.humanId);
            });
        });
        MemberFactory.instance.read().then(ms => {
            ms.forEach(m => {
                this.save(`rights:${m.towerId}/${m.humanId}`, JSON.stringify(m.secret.permissions));
            });
        });
    }
    constructor() {
        MemoryDriver._instance = this;
        this.redisClient = redis.createClient();
        const app = express();
        app.use(cors());
        this.redisClient.connect().then(() => {
            this.redisClient.on('error', function (err) {
                console.log('Could not establish a connection with redis. ' + err);
            });
            this.redisClient.on('connect', function (err) {
                console.log('Connected to redis successfully');
            });
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            let redisStore = new RedisStore({
                client: this.redisClient,
                prefix: "sigma:",
            })
            app.use(session({
                name: config.REDIS_SESSION_NAME,
                resave: false,
                saveUninitialized: false,
                store: redisStore,
                secret: config.REDIS_SESSION_SECRET,
                cookie: {
                    maxAge: 1000 * 60 * 60 * 2,
                    sameSite: true,
                    secure: true
                }
            }));
            app.listen(config.REDIS_EXPRESS_PORT, () => { console.log(`server is listening on ${config.REDIS_EXPRESS_PORT}`) });
            this.loadAuthIntoMemory();
        });
    }
}

export default MemoryDriver
