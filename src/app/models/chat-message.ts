export interface ChatMessage {
  id?: number;              // ID del mensaje en BD
  message: string;
  user: string;
  timestamp?: Date;
  replyTo?: {               // Mensaje al que se responde
    id: number;
    message: string;
    user: string;
  };
}