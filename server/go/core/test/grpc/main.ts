import { IHumanService } from './services';
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

const target = 'localhost:8000';

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
                    this.token = result.session.token;
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
                    this.token = result.session.token;
                }
                return ({ result, error: null })
            })
            .catch((error: Error) => ({ error, result: null }));
    }
    public async callUpdate(input: HumanUpdateDto): Promise<{ result: HumanUpdateOutput, error: any }> {
        if (this.token) {
            const result = promisify(this.update).bind(this);
            const meta = new grpc.Metadata();
            meta.add('token', this.token);
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

(async () => {
    try {
        const humanService = new HumanService();
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
        }
    } catch (error) {
        console.log({
            props: { error },
        });
    }
})();
