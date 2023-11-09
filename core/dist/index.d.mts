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

declare class BaseService {
}

declare abstract class BaseMachine extends BaseService {
    abstract getName(): string;
    abstract getService(): {
        [id: string]: any;
    };
    abstract getClient(): string;
    route(key: Array<string>, client: Client, body: any): Promise<unknown>;
}

declare class Sigma {
    start(): Promise<void>;
    shell(machines: Array<BaseMachine>): void;
    constructor(conf: any);
}

declare class Action {
    guardian: {
        authenticate?: boolean;
        authorize?: boolean;
        inRoom?: boolean;
    };
    func: (client: Client, body: any, guardianReport?: {
        towerId: string;
        permissions: {
            [id: string]: boolean;
        };
        roomId?: string;
    }) => any;
    constructor(guardian: {
        authenticate?: boolean;
        authorize?: boolean;
        inRoom?: boolean;
    }, func: (client: Client, body: any, guardianReport?: {
        towerId: string;
        permissions: {
            [id: string]: boolean;
        };
        roomId?: string;
    }) => any);
}

declare class Update {
    requestId: string;
    constructor(requestId: string);
}

declare const _default: {
    types: {
        tower: {
            onUpdate: {
                category: string;
                key: string;
            };
            onRemove: {
                category: string;
                key: string;
            };
            onHumanJoin: {
                category: string;
                key: string;
            };
        };
        room: {
            onCreate: {
                category: string;
                key: string;
            };
            onUpdate: {
                category: string;
                key: string;
            };
            onRemove: {
                category: string;
                key: string;
            };
        };
        permission: {
            onUpdate: {
                category: string;
                key: string;
            };
        };
        invite: {
            onCreate: {
                category: string;
                key: string;
            };
            onCancel: {
                category: string;
                key: string;
            };
            onAccept: {
                category: string;
                key: string;
            };
            onDecline: {
                category: string;
                key: string;
            };
        };
        worker: {
            onRequest: {
                category: string;
                key: string;
            };
            onResponse: {
                category: string;
                key: string;
            };
        };
    };
    buildUpdate: (requestId: string, path: {
        category: string;
        key: string;
    }, ...args: any[]) => any;
    registerUpdateType: <T extends Update>(type: T, path: {
        category: "string";
        key: "string";
    }) => void;
    group: (towerId: string) => {
        emit: (packet: any) => void;
        boradcast: {
            emit: (client: Client, packet: any) => void;
        };
    };
};

export { Action, BaseMachine, Client, Sigma, _default as Updater };
