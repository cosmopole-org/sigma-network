
import express from 'express'
import redis, { RedisClientType } from 'redis';
import config from '../../config.json';
import session from 'express-session';
import bodyParser from 'body-parser';
import SessionFactory from 'src/database/factories/session-factory';
import MemberFactory from 'src/database/factories/member-factory';
import cors from "cors";
import { ISession } from '../../models/session.model'

const redisStore = require('connect-redis')(session)

const app = express();
app.use(cors());

class MemoryDriver {
    static _instance: MemoryDriver;
    static initialize() {
        return new MemoryDriver();
    }
    static instance() {
        return MemoryDriver._instance;
    }
    redisClient: RedisClientType;
    async save(key, value) {
        await this.redisClient.set(key, value);
    }
    fetch(key, callback) {
        this.redisClient.get(key).then(function (obj) {
            if (!obj) {
                console.log('key not found');
                if (callback) callback(undefined);
                return;
            }
            if (callback) callback(obj);
        });
    }
    loadAuthIntoMemory() {
        SessionFactory.instance().read().then((ss: Array<ISession>) => {
            ss.forEach(s => {
                this.save(`auth:${s.token}`, s.userId);
            });
        });
        MemberFactory.instance().read().then(ms => {
            ms.forEach(m => {
                this.save(`rights:${m.towerId}/${m.userId}`, JSON.stringify(m.secret.permissions));
            });
        });
    }
    constructor() {
        MemoryDriver._instance = this;
        this.save = this.save.bind(this);
        this.fetch = this.fetch.bind(this);
        this.loadAuthIntoMemory = this.loadAuthIntoMemory.bind(this);
        this.redisClient = redis.createClient();
        this.redisClient.connect().then(() => {
            this.redisClient.on('error', function (err) {
                console.log('Could not establish a connection with redis. ' + err);
            });
            this.redisClient.on('connect', function (err) {
                console.log('Connected to redis successfully');
            });
            const sessionStore = new redisStore({ client: this.redisClient });
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
            app.use(session({
                name: config.REDIS_SESSION_NAME,
                resave: false,
                saveUninitialized: false,
                store: sessionStore,
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

module.exports = MemoryDriver;
