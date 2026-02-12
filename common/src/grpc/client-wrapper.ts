import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import logger from '../logger';

export class GrpcClientWrapper {
    static loadProto(protoPath: string) {
        const packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        return grpc.loadPackageDefinition(packageDefinition);
    }

    static createClient(clientClass: any, address: string) {
        return new clientClass(address, grpc.credentials.createInsecure());
    }
}
