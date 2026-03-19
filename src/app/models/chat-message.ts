export interface ChatMessage {
    id?: number;
    message: string;
    user: string;
    timestamp?: Date;
    idConversacion?: number; // <--- AGREGAR ESTO
    replyTo?: {
        id: number;
        message: string;
        user: string;
    };
}