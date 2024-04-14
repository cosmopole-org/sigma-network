import { IHumanService, ITowerService } from './services';
import { promisify } from 'util';
import * as grpc from '@grpc/grpc-js';
import { HumanSignupDto } from './sigma/HumanSignupDto';
import { HumanVerifyDto } from 'sigma/HumanVerifyDto';
import { HumanVerifyOutput } from 'sigma/HumanVerifyOutput';
import { HumanSignupOutput } from 'sigma/HumanSignupOutput';
import { HumanCompleteDto } from 'sigma/HumanCompleteDto';
import { HumanCompleteOutput } from 'sigma/HumanCompleteOutput';
import { HumanUpdateDto } from 'sigma/HumanUpdateDto';
import { HumanUpdateOutput } from 'sigma/HumanUpdateOutput';
import { HumanGetDto } from 'sigma/HumanGetDto';
import { HumanGetOutput } from 'sigma/HumanGetOutput';
import { TowerCreateDto } from 'sigma/TowerCreateDto';
import { TowerCreateOutput } from 'sigma/TowerCreateOutput';
import { TowerUpdateDto } from 'sigma/TowerUpdateDto';
import { TowerUpdateOutput } from 'sigma/TowerUpdateOutput';
import { TowerDeleteDto } from 'sigma/TowerDeleteDto';
import { TowerDeleteOutput } from 'sigma/TowerDeleteOutput';
import { TowerJoinDto } from 'sigma/TowerJoinDto';
import { TowerJoinOutput } from 'sigma/TowerJoinOutput';
import { TowerGetDto } from 'sigma/TowerGetDto';
import { TowerGetOutput } from 'sigma/TowerGetOutput';

const target: string = 'localhost:8000';
let token: string | undefined = undefined;

export class HumanService extends IHumanService {
    constructor() {
        super(target, grpc.credentials.createInsecure());
    }

    clientCode: string | undefined = undefined;
    token: string | undefined = undefined;

    public async callSignup(input: HumanSignupDto): Promise<{ result: HumanSignupOutput, error: any }> {
        const result = promisify(this.signup).bind(this);
        return await result(input)
            .then((result: HumanSignupOutput) => {
                if (result.pending) {
                    this.clientCode = result.pending.clientCode;
                }
                return ({ result, error: null })
            })
            .catch((error: Error) => ({ error, result: null }));
    }
    public async callVerify(input: HumanVerifyDto): Promise<{ result: HumanVerifyOutput, error: any }> {
        const result = promisify(this.verify).bind(this);
        return await result({ ...input, clientCode: this.clientCode })
            .then((result: HumanVerifyOutput) => {
                if (result.pending) {
                    this.clientCode = result.pending.clientCode;
                }
                if (result.session?.token) {
                    token = result.session.token;
                }
                return ({ result, error: null })
            })
            .catch((error: Error) => ({ error, result: null }));
    }
    public async callComplete(input: HumanCompleteDto): Promise<{ result: HumanCompleteOutput, error: any }> {
        const result = promisify(this.complete).bind(this);
        return await result({ ...input, clientCode: this.clientCode })
            .then((result: HumanCompleteOutput) => {
                if (result.session?.token) {
                    token = result.session.token;
                }
                return ({ result, error: null })
            })
            .catch((error: Error) => ({ error, result: null }));
    }
    public async callUpdate(input: HumanUpdateDto): Promise<{ result: HumanUpdateOutput, error: any }> {
        if (token) {
            const result = promisify(this.update).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result) => ({ result, error: null }))
                .catch((error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
    public async callGet(input: HumanGetDto): Promise<{ result: HumanGetOutput, error: any }> {
        const result = promisify(this.get).bind(this);
        return await result(input)
            .then((result: HumanGetDto) => ({ result, error: null }))
            .catch((error: Error) => ({ error, result: null }));
    }
}

export class TowerService extends ITowerService {
    constructor() {
        super(target, grpc.credentials.createInsecure());
    }

    public async callCreate(input: TowerCreateDto): Promise<{ result: TowerCreateOutput, error: any }> {
        if (token) {
            const result = promisify(this.create).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result: TowerCreateOutput) => ({ result, error: null }))
                .catch((error: Error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
    public async callUpdate(input: TowerUpdateDto): Promise<{ result: TowerUpdateOutput, error: any }> {
        if (token) {
            const result = promisify(this.update).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result: TowerUpdateOutput) => ({ result, error: null }))
                .catch((error: Error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
    public async callDelete(input: TowerDeleteDto): Promise<{ result: TowerDeleteOutput, error: any }> {
        if (token) {
            const result = promisify(this.delete).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result: TowerDeleteOutput) => ({ result, error: null }))
                .catch((error: Error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
    public async callJoin(input: TowerJoinDto): Promise<{ result: TowerJoinOutput, error: any }> {
        if (token) {
            const result = promisify(this.join).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result: TowerJoinOutput) => ({ result, error: null }))
                .catch((error: Error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
    public async callGet(input: TowerGetDto): Promise<{ result: TowerGetOutput, error: any }> {
        if (token) {
            const result = promisify(this.get).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', token);
            return await result(input, meta)
                .then((result: TowerGetOutput) => ({ result, error: null }))
                .catch((error: Error) => ({ error, result: null }));
        } else {
            return Promise.reject(new Error('no token found'));
        }
    }
}

(async () => {
    try {
        const humanService = new HumanService();
        const towerService = new TowerService();
        for (let i = 0; i < 1; i++) {
            const { result: r1, error: e1 } = await humanService.callSignup({ email: "keyhan121" });
            console.log({
                props: { r1, e1 },
            });
            const { result: r2, error: e2 } = await humanService.callVerify({ verifyCode: r1.pending.verifyCode });
            console.log({
                props: { r2, e2 },
            });
            if (!r2.human) {
                const { result: r3, error: e3 } = await humanService.callComplete({ verifyCode: r2.pending.verifyCode, firstName: 'edward', lastName: 'kasperian' });
                console.log({
                    props: { r3, e3 },
                });
            }
            const { result: r4, error: e4 } = await humanService.callUpdate({ firstName: 'edward', lastName: 'kasperian' });
            console.log({
                props: { r4, e4 },
            });
            const { result: r5, error: e5 } = await humanService.callGet({ userId: r4.human.id.toString() });
            console.log({
                props: { r5, e5 },
            });
            const { result: r6, error: e6 } = await towerService.callCreate({ name: "test tower", avatarId: 123, isPublic: false });
            console.log({
                props: { r6, e6 },
            });
        }
    } catch (error) {
        console.log({
            props: { error },
        });
    }
})();
