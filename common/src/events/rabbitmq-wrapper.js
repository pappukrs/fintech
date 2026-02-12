"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqp = __importStar(require("amqplib"));
const logger_1 = __importDefault(require("../logger"));
class RabbitMQWrapper {
    _connection;
    _publishChannel;
    get connection() {
        if (!this._connection) {
            throw new Error('Cannot access RabbitMQ connection before connecting');
        }
        return this._connection;
    }
    get publishChannel() {
        if (!this._publishChannel) {
            throw new Error('Cannot access RabbitMQ publish channel before connecting');
        }
        return this._publishChannel;
    }
    async connect(url) {
        try {
            this._connection = await amqp.connect(url);
            this._publishChannel = await this._connection.createChannel();
            logger_1.default.info('Connected to RabbitMQ successfully');
            this._connection.on('close', () => {
                logger_1.default.error('RabbitMQ connection closed!');
                process.exit();
            });
            this._connection.on('error', (err) => {
                logger_1.default.error('RabbitMQ connection error', { err });
            });
        }
        catch (error) {
            logger_1.default.error('Failed to connect to RabbitMQ', { error });
            throw error;
        }
    }
    async publish(exchange, routingKey, data) {
        try {
            this.publishChannel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
        }
        catch (error) {
            logger_1.default.error('Failed to publish event to RabbitMQ', { error, exchange, routingKey });
            throw error;
        }
    }
    async subscribe(queue, onMessage) {
        try {
            const channel = await this.connection.createChannel();
            await channel.assertQueue(queue, { durable: true });
            channel.consume(queue, onMessage, { noAck: false });
        }
        catch (error) {
            logger_1.default.error('Failed to subscribe to RabbitMQ queue', { error, queue });
            throw error;
        }
    }
}
exports.default = new RabbitMQWrapper();
//# sourceMappingURL=rabbitmq-wrapper.js.map