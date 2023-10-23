import { Emitter } from '@socket.io/redis-emitter';
import { Socket } from 'socket.io';

declare class Client {
    socket: Socket;
    isGuest: boolean;
    humanId: string;
    towerId: string;
    rights: {
        [id: string]: boolean;
    };
    emitter: Emitter;
    reset(): void;
    updateHumanId(humanId: string): void;
    updateTowerId(towerId: string, rights: {
        [id: string]: boolean;
    }): void;
    emit(update: any): void;
    joinTower(towerId: string): void;
    leaveTower(towerId: string): void;
    joinTowers(towerIds: Array<string>): void;
    leaveTowers(towerIds: Array<string>): void;
    constructor(socket: Socket, emitter: Emitter);
}

declare class Action {
    guardian: {
        authenticate: true;
        authorize: true;
    };
    func: (client: Client, body: any, guardianReport?: {
        towerId: string;
        permissions: {
            [id: string]: boolean;
        };
    }) => any;
    constructor(guardian: {
        authenticate: true;
        authorize: true;
    }, func: (client: Client, body: any, guardianReport?: {
        towerId: string;
        permissions: {
            [id: string]: boolean;
        };
    }) => any);
}

declare class BaseService {
}

declare abstract class BaseMachine extends BaseService {
    abstract getName(): string;
    abstract getService(): {
        [id: string]: Action;
    };
    abstract getClient(): string;
    route(key: string, client: Client, body: any): Promise<unknown>;
}

declare class Sigma {
    start(): Promise<void>;
    shell(machines: Array<BaseMachine>): void;
    constructor(conf: any);
}

export { Action, BaseMachine, Client, Sigma };
