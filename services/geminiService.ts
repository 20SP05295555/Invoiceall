import { GoogleGenAI, Type } from "@google/genai";

export const generateEmailReply = async (
  previousEmails: string,
  customerName: string,
  context: string
): Promise<string> => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return "Error: API Key is missing. Please provide a valid API key in your environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `
      You are a helpful customer service agent named Emma at HOB FURNITURE.
      Draft a polite, professional, and concise email reply to the customer, ${customerName}.
      
      Context of the order:
      ${context}

      Previous conversation history:
      ${previousEmails}

      The customer is asking a question. Please answer it inventively but professionally (assume the fabric IS stain resistant for this demo).
      Do not include the subject line, just the body of the email. Keep it under 150 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't generate a draft at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating draft. Please ensure your API key is correctly configured.";
  }
};

export const extractDataFromDocument = async (base64Data: string, mimeType: string): Promise<any> => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      },
      {
        text: "Extract all relevant information from this invoice or order document. Convert it into the exact JSON format requested. If a field is missing, provide a reasonable default based on the context."
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          companyInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              contact: { type: Type.STRING },
              address: { type: Type.ARRAY, items: { type: Type.STRING } },
              regNo: { type: Type.STRING },
              email: { type: Type.STRING },
              website: { type: Type.STRING },
              terms: { type: Type.STRING },
              paymentInstructions: { type: Type.STRING },
              bankName: { type: Type.STRING },
              sortCode: { type: Type.STRING },
              accountNo: { type: Type.STRING },
              accountHolder: { type: Type.STRING },
            }
          },
          customer: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              address: { type: Type.ARRAY, items: { type: Type.STRING } },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
            }
          },
          order: {
            type: Type.OBJECT,
            properties: {
              orderNumber: { type: Type.STRING },
              date: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              status: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    details: { type: Type.ARRAY, items: { type: Type.STRING } },
                    quantity: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    total: { type: Type.NUMBER }
                  }
                }
              },
              amountPaid: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};