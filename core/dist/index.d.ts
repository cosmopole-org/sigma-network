import { Emitter } from '@socket.io/redis-emitter';
import { Socket } from 'socket.io';
import express from 'express';
import { ClientSession } from 'mongoose';

declare class Update {
    requestId: string;
    type: string;
    constructor(requestId: string);
}

declare class Client {
    socket: Socket;
    isGuest: boolean;
    humanId: string;
    towerId: string;
    rights: {
        [id: string]: boolean;
    };
    emitter: Emitter;
    token: string;
    reset(): void;
    updateToken(token: string): void;
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
    routeRest(key: Array<string>, client: Client, req: express.Request, res: express.Response): Promise<unknown>;
}

interface IRoom {
    id: string;
    title: string;
    avatarId: string;
    towerId: string;
    floor: string;
    isPublic: boolean;
    secret: any;
}

declare class Sigma {
    roomCreationCallback: (room: IRoom, mongoSession: ClientSession) => void;
    onRoomCreation(callback: (room: IRoom, mongoSession: ClientSession) => void): void;
    start(): Promise<void>;
    shell(machines: Array<BaseMachine>): void;
    core(): {
        [id: string]: BaseService;
    };
    clients(humanId: string): Client;
    admin: {
        addMember: (towerId: string, humanId: string) => any;
    };
    guardian: {
        authenticate: (token: string) => Promise<{
            granted: boolean;
            humanId: any;
        } | {
            granted: boolean;
            humanId?: undefined;
        }>;
        authorize: (client: Client, towerId: string, roomId?: string) => Promise<{
            granted: boolean;
            rights?: undefined;
            roomId?: undefined;
        } | {
            granted: boolean;
            rights: any;
            roomId: string;
        } | {
            granted: boolean;
            rights: any;
            roomId?: undefined;
        }>;
        rules: {
            addRule: (towerId: string, humanId: string, permissions: {
                [id: string]: boolean;
            }) => void;
            isRule: (towerId: string, humanId: string) => Promise<boolean>;
            removeRule: (towerId: string, humanId: string) => void;
            removeRules: (towerId: string, humanIds: string[]) => void;
        };
    };
    updater: {
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
            category: string;
            key: string;
        }) => void;
        group: (towerId: string) => {
            emit: (packet: any) => void;
            boradcast: {
                emit: (client: Client, packet: any) => void;
            };
        };
    };
    constructor(conf: any);
}

declare class Action {
    guardian: {
        authenticate?: boolean;
        authorize?: boolean;
        inRoom?: boolean;
    };
    func: any;
    constructor(guardian: {
        authenticate?: boolean;
        authorize?: boolean;
        inRoom?: boolean;
    }, func: any);
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
        category: string;
        key: string;
    }) => void;
    group: (towerId: string) => {
        emit: (packet: any) => void;
        boradcast: {
            emit: (client: Client, packet: any) => void;
        };
    };
};

export { Action, BaseMachine, Client, Sigma, Update, _default as Updater };
