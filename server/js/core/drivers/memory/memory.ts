
import express from 'express'
import * as redis from 'redis';
import config from '../../config';
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
    async save(key: string, value: any): Promise<any> {
        await this.redisClient.set(key, JSON.stringify(value));
    }
    async remove(key: string | Array<string>): Promise<void> {
        await this.redisClient.del(key);
    }
    fetch(key: string): Promise<any> {
        return new Promise(resolve => {
            this.redisClient.get(key).then(function (obj) {
                if (!obj) {
                    console.log('key not found:', key);
                    resolve(undefined);
                    return;
                }
                resolve(JSON.parse(obj));
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
        this.redisClient = redis.createClient({ url: config['REDIS_URI'] });
        this.redisClient.connect().then(async () => {
            this.redisClient.on('error', function (err) {
                console.log('Could not establish a connection with redis. ' + err);
            });
            this.redisClient.on('connect', function (err) {
                console.log('Connected to redis successfully');
            });
            this.loadAuthIntoMemory();
        });
    }
}

export default MemoryDriver
