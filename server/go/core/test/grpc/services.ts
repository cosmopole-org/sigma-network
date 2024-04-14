
import { ProtoGrpcType } from './packets';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), './packets.proto');

// suggested options for similarity to loading grpc.load behavior
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  defaults: true,
  oneofs: true,
});

const clientService = (
  grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType
).sigma;

export const { HumanService: IHumanService } = clientService;
