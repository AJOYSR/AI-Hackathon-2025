import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LocalAIService {
  private readonly OLLAMA_BASE_URL = 'http://localhost:11434';
  private readonly CHAT_MODEL = 'intent-ai:latest';
  private readonly EMBEDDING_MODEL = 'nomic-embed-text:latest';

  /**
   * Sends a chat message to the local Ollama model
   * @param message - The user's message
   * @returns The AI's response
   */
  async returnIntent(message: string): Promise<string> {
    try {
      const response = await axios.post(`${this.OLLAMA_BASE_URL}/api/chat`, {
        model: this.CHAT_MODEL,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        stream: false,
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to get response from local AI model');
    }
  }

  /**
   * Generates embeddings for the given text using the local embedding model
   * @param text - The text to generate embeddings for
   * @returns The embedding vector
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.OLLAMA_BASE_URL}/api/embeddings`,
        {
          model: this.EMBEDDING_MODEL,
          prompt: text,
        },
      );

      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }
}
