declare class RabbitMQWrapper {
    private _connection;
    private _publishChannel;
    get connection(): any;
    get publishChannel(): any;
    connect(url: string): Promise<void>;
    publish(exchange: string, routingKey: string, data: any): Promise<void>;
    subscribe(queue: string, onMessage: (msg: any) => void): Promise<void>;
}
declare const _default: RabbitMQWrapper;
export default _default;
//# sourceMappingURL=rabbitmq-wrapper.d.ts.map