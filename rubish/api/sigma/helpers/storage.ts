
import {UserCollection, userSchema} from "../models/user";
import {createRxDatabase, addRxPlugin, RxDatabase} from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import {SessionCollection, sessionSchema} from "../models/session";
import {SpaceCollection, spaceSchema} from "../models/space";
import {TopicCollection, topicSchema} from "../models/topic";
import {MemberCollection, memberSchema} from "../models/member";
import {InviteCollection, inviteSchema} from "../models/invite";
import {SecretCollection, secretSchema} from "../models/secret";

addRxPlugin(RxDBDevModePlugin);

export type DatabaseCollections = {
    users: UserCollection
    sessions: SessionCollection
    spaces: SpaceCollection
    topics: TopicCollection
    members: MemberCollection
    invites: InviteCollection
    secrets: SecretCollection
}

export default class Storage {
    public db: RxDatabase<DatabaseCollections> = {} as any
    public async run() {
        this.db = await createRxDatabase<DatabaseCollections>({
            name: 'sigma',
            storage: getRxStorageDexie(),
            password: 'sigma',             // <- password (optional)
            multiInstance: true,                // <- multiInstance (optional, default: true)
            eventReduce: true,                  // <- eventReduce (optional, default: false)
            cleanupPolicy: {}                   // <- custom cleanup policy (optional)
        });
        await this.db.addCollections({
            users: {
                schema: userSchema
            },
            sessions: {
                schema: sessionSchema
            },
            spaces: {
                schema: spaceSchema
            },
            topics: {
                schema: topicSchema
            },
            members: {
                schema: memberSchema
            },
            invites: {
                schema: inviteSchema
            },
            secrets: {
                schema: secretSchema
            }
        })
        this.db.$.subscribe(changeEvent => console.dir(changeEvent));
    }
}
