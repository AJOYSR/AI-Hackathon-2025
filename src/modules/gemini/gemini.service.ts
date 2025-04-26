/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;
  private textModel: any;
  private intendAI: any;

  constructor() {
    // Initialize Google Generative AI with your API key
    this.genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );

    // Initialize the embedding model
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    // Initialize the text generation model
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `
      You are an intelligent assistant for a website FAQ. Your task is to rewrite formal or technical answers into clear, friendly, and helpful responses that sound like they're from a knowledgeable human.

      Rules to follow:
      1. Stick to the facts — avoid adding guesses or unnecessary details.
      2. Use a natural, friendly, and helpful tone that feels human, not robotic.
      3. Keep the response concise yet informative.
      4. Use simple, everyday language — avoid jargon unless it's essential for understanding.
      5. Ensure all key information from the original answer is preserved.
      6. Structure the response logically, making it easy to follow.
      7. If the question is unclear, provide the most relevant and practical answer without over-explaining.
      8. IMPORTANT: Format your entire response using proper markdown. Use markdown formatting for:
         - Headings (## for main headings, ### for subheadings)
         - **Bold text** for emphasis
         - *Italic text* for secondary emphasis
         - Bullet points and numbered lists
         - Code blocks with backticks when showing technical content
         - Tables when presenting structured information
         - > Blockquotes for highlighting important information

      **Output only the improved answer with proper markdown formatting — no introductions, explanations, or formatting comments.**
      `,
    });

    // Initialize the text generation model
    this.intendAI = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `# Overview  
You are an advanced intent detection system for a customer service platform.

## Context  
- Your main function is to classify incoming user queries into predefined product-related categories.
- In addition to identifying the category, you must extract optional product information such as product title and price range (minimum and maximum prices).
- Your responses must always be in a specific JSON format to be compatible with automated systems.

## Instructions  
1. Analyze the user's query carefully to understand what product or type of item they are referring to.
2. Classify the query into one of the predefined intent categories.
3. If the user mentions a specific product, extract and return the product title.
4. If the query includes price details, identify and return the minimum and maximum price values.
5. If any value cannot be determined, leave it as an empty string.

## Tools  
- NLP Parser for intent classification  
- Named Entity Recognition (NER) for product and price extraction  
- Rule-based pattern matching (e.g., regex) for extracting price values  

## Examples  
- Input: "Looking for a gaming laptop around $1500 to $2000"  
  Output: {"category":"Computers and Accessories", "title":"gaming laptop", "min_price":"1500", "max_price":"2000"}

- Input: "Need a violin for my son"  
  Output: {"category":"Musical Instruments", "title":"violin", "min_price":"", "max_price":""}

- Input: "Show me some tools for kitchen renovation"  
  Output: {"category":"Tools and Home Improvement", "title":"tools for kitchen renovation", "min_price":"", "max_price":""}

- Input: "Where can I find noise-canceling headphones under $300?"  
  Output: {"category":"Other Electronics", "title":"noise-canceling headphones", "min_price":"", "max_price":"300"}

## SOP (Standard Operating Procedure)  
1. Preprocess the user query (lowercase, remove noise, etc.).
2. Match keywords and context to one of the predefined categories:
   - "Computers_and_Accessories"
   - "Tools_and_Home_Improvement"
   - "Camera_and_Photo"
   - "Office_Products"
   - "Cellphones_and_Accessories"
   - "Luggage_and_Travel_Gear"
   - "Video_Games"
   - "Musical_Instruments"
   - "Other_Electronics"
   - "Other"
3. Use NER and regex to detect product names and price ranges.
4. Populate the following JSON structure with appropriate values:
   {
     "category": "Category Name",
     "title": "Product title (if found)",
     "min_price": "Minimum price (if found)",
     "max_price": "Maximum price (if found)"
   }
5. Return the JSON response without any additional text.

## Final Notes  
- Always return the response in strict JSON format.  
- Avoid making assumptions; default to "Other" if the category is unclear.  
- Leave fields blank if no specific value is identified.`,
    });
  }

  /**
   * Enhances the FAQ answer to make it sound more natural and human-like
   * @param question - The user's question
   * @param answer - The original answer from the FAQ database
   * @returns Enhanced answer that sounds more conversational
   */
  async enhanceAnswer(question: string, answer: string): Promise<string> {
    // System prompt designed to guide the AI to enhance the answer
    const prompt = `
The user's question is: 
${question}

The original answer is: 
${answer}

Rewrite this answer to make it more conversational and helpful while maintaining accuracy.
Format your response using proper markdown including headings, bold/italic text, lists, and other markdown elements as appropriate.
`;

    try {
      const result = await this.textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      });

      const response = result.response;

      // Get the raw text with markdown formatting preserved
      return response.text();
    } catch (error) {
      console.error('Error enhancing answer:', error);
      // Return the original answer if enhancement fails
      return answer;
    }
  }

  /**
   * Enhances the FAQ answer to make it sound more natural and human-like
   * @param question - The user's question
   * @param answer - The original answer from the FAQ database
   * @returns Enhanced answer that sounds more conversational
   */
  async returnIntent(question: string): Promise<any> {
    // System prompt designed to guide the AI to enhance the answer
    const prompt = `# Overview  
You are an advanced intent detection system for a customer service platform.

## Context  
- Your main function is to classify incoming user queries into predefined product-related categories.
- In addition to identifying the category, you must extract optional product information such as product title and price range (minimum and maximum prices).
- Your responses must always be in a specific JSON format to be compatible with automated systems.

## Instructions  
1. Analyze the user's query carefully to understand what product or type of item they are referring to.
2. Classify the query into one of the predefined intent categories.
3. If the user mentions a specific product, extract and return the product title.
4. If the query includes price details, identify and return the minimum and maximum price values.
5. If any value cannot be determined, leave it as an empty string.

## Tools  
- NLP Parser for intent classification  
- Named Entity Recognition (NER) for product and price extraction  
- Rule-based pattern matching (e.g., regex) for extracting price values  

## Examples  
- Input: "Looking for a gaming laptop around $1500 to $2000"  
  Output: {"category":"Computers and Accessories", "title":"gaming laptop", "min_price":"1500", "max_price":"2000"}

- Input: "Need a violin for my son"  
  Output: {"category":"Musical Instruments", "title":"violin", "min_price":"", "max_price":""}

- Input: "Show me some tools for kitchen renovation"  
  Output: {"category":"Tools and Home Improvement", "title":"tools for kitchen renovation", "min_price":"", "max_price":""}

- Input: "Where can I find noise-canceling headphones under $300?"  
  Output: {"category":"Other Electronics", "title":"noise-canceling headphones", "min_price":"", "max_price":"300"}

## SOP (Standard Operating Procedure)  
1. Preprocess the user query (lowercase, remove noise, etc.).
2. Match keywords and context to one of the predefined categories:
    - "Computers_and_Accessories"
    - "Tools_and_Home_Improvement"
    - "Camera_and_Photo"
    - "Office_Products"
    - "Cellphones_and_Accessories"
    - "Luggage_and_Travel_Gear"
    - "Video_Games"
    - "Musical_Instruments"
    - "Other_Electronics"
   - "Other"
3. Use NER and regex to detect product names and price ranges.
4. Populate the following JSON structure with appropriate values:
   {
     "category": "Category Name",
     "title": "Product title (if found)",
     "min_price": "Minimum price (if found)",
     "max_price": "Maximum price (if found)"
   }
5. Return the JSON response without any additional text.

## Final Notes  
- Always return the response in strict JSON format.  
- Avoid making assumptions; default to "Other" if the category is unclear.  
- Leave fields blank if no specific value is identified.
- Make sure you always return category as it is written here.
The user's query is: 
${question}
Now return the json response.
`;

    try {
      const result = await this.textModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      });

      const response = result.response;

      // Get the raw text with markdown formatting preserved
      return response.text();
    } catch (error) {
      console.error('Error enhancing answer:', error);
      // Return the original answer if enhancement fails
      return {};
    }
  }

  /**
   * Generates vector embeddings for text that can be stored in the database
   * @param text - The text to generate embeddings for
   * @returns Vector embeddings with 768 dimensions
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text content cannot be empty');
      }

      const result = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
      });

      // Return embeddings with 768 dimensions
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Comprehensive method to process a FAQ item - enhances the answer and generates embeddings
   * @param question - The FAQ question
   * @param answer - The original FAQ answer
   * @returns Object containing enhanced answer and embeddings
   */
  async processFaqItem(
    question: string,
    answer: string,
  ): Promise<{
    enhancedAnswer: string;
    questionEmbedding: number[];
    answerEmbedding: number[];
  }> {
    try {
      // Process in parallel for efficiency
      const [enhancedAnswer, questionEmbedding, answerEmbedding] =
        await Promise.all([
          this.enhanceAnswer(question, answer),
          this.generateEmbeddings(question),
          this.generateEmbeddings(answer),
        ]);

      return {
        enhancedAnswer,
        questionEmbedding,
        answerEmbedding,
      };
    } catch (error) {
      console.error('Error processing FAQ item:', error);
      throw error;
    }
  }
}
