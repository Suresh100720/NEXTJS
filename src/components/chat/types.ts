export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  documentName?: string | null;
  documentText?: string | null;
}
