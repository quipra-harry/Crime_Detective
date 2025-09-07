export interface ChatMessage {
  speaker: 'AI' | 'Witness';
  text: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  images: string[]; // Array of base64 strings
  conversation: ChatMessage[];
  createdAt: number;
}
