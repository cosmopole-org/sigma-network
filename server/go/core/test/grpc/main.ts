import { HumanService } from './services';
import { promisify } from 'util';
import * as grpc from '@grpc/grpc-js';
import { HumanSignupDto } from './sigma/HumanSignupDto';

const target = 'localhost:8000';

export class ClientService extends HumanService {
    constructor() {
        super(target, grpc.credentials.createInsecure());
    }

    public async callSignup(input: HumanSignupDto) {
        const result = promisify(this.signup).bind(this);
        return await result(input)
            .then((client) => ({ client, error: null }))
            .catch((error) => ({ error, client: null }));
    }
}

(async () => {
    try {
        const authService = new ClientService();
        for (let i = 0; i < 10; i++) {
            const { client, error } = await authService.callSignup({ email: "keyhan121" });
            console.log({
                props: { client, error },
            });
        }
    } catch (error) {
        console.log({
            props: { error },
        });
    }
})();
