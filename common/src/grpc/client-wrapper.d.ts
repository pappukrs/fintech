import * as grpc from '@grpc/grpc-js';
export declare class GrpcClientWrapper {
    static loadProto(protoPath: string): grpc.GrpcObject;
    static createClient(clientClass: any, address: string): any;
}
//# sourceMappingURL=client-wrapper.d.ts.map