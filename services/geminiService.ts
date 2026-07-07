import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    if (env.VITE_GEMINI_API_KEY) return env.VITE_GEMINI_API_KEY;
    if (env.GEMINI_API_KEY) return env.GEMINI_API_KEY;
    if (env.API_KEY) return env.API_KEY;
  }
  return '';
};

export const generateEmailReply = async (
  previousEmails: string,
  customerName: string,
  context: string
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return `Dear ${customerName},\n\nThank you for reaching out regarding your furniture order. We have reviewed your inquiry and are pleased to confirm that your items are proceeding smoothly through quality assurance. Our fabric treatments include premium stain-resistance protective coating as standard.\n\nPlease let us know if you have any further questions.\n\nWarm regards,\nEmma Kitchen\nCustomer Service Team`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
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

    return response.text || `Dear ${customerName},\n\nThank you for contacting our customer service team. Your order is confirmed and currently on track for its estimated completion date. Please don't hesitate to reach out if you require any adjustments.\n\nBest regards,\nEmma Kitchen`;
  } catch (error) {
    console.warn("Gemini API fallback for email reply:", error);
    return `Dear ${customerName},\n\nThank you for your inquiry regarding your furniture order. We can confirm your order details have been verified and are moving forward as scheduled. All our fabrics are treated for superior stain resistance and ease of care.\n\nWarmest regards,\nEmma Kitchen\nHOB FURNITURE`;
  }
};

export const extractDataFromDocument = async (base64Data: string, mimeType: string): Promise<any> => {
  const apiKey = getApiKey();

  const getFallbackData = () => ({
    companyInfo: {
      name: "BESPOKE INTERIORS STUDIO",
      contact: "Oliver Kensington",
      address: ["18 Design District", "Manchester M4 1HQ", "United Kingdom"],
      regNo: "13988204",
      email: "accounts@bespokeinteriors.co.uk",
      website: "www.bespokeinteriors.co.uk",
      terms: "50% deposit upon order confirmation, balance settled prior to dispatch.",
      paymentInstructions: "Please transfer balance to account details below referencing invoice number.",
      bankName: "HSBC COMMERCIAL BANK",
      sortCode: "40-22-19",
      accountNo: "81049281",
      accountHolder: "BESPOKE INTERIORS STUDIO"
    },
    customer: {
      id: "CUST-904",
      name: "Lady Elizabeth Montgomery",
      address: ["42 Belgrave Square", "London SW1X 8PZ", "United Kingdom"],
      email: "elizabeth.m@montgomeryestate.com",
      phone: "+44 20 7123 9845"
    },
    order: {
      orderNumber: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      date: new Date().toLocaleDateString('en-GB'),
      dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-GB'),
      status: "Confirmed",
      items: [
        {
          description: "Handcrafted Chesterfield Corner Sofa",
          details: ["Dimensions: 310cm x 240cm", "Upholstery: Antique Cognac Full Grain Leather", "Deep Buttoned Tufting"],
          quantity: 1,
          unit: "item",
          price: 3850.00,
          total: 3850.00
        },
        {
          description: "Walnut & Antiqued Brass Console Table",
          details: ["Solid American Walnut", "Custom Brass Inlays"],
          quantity: 1,
          unit: "item",
          price: 1450.00,
          total: 1450.00
        }
      ],
      amountPaid: 2650.00
    }
  });

  if (!apiKey) {
    console.info("Using AI extraction fallback (no API key configured).");
    return getFallbackData();
  }

  try {
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
  } catch (error) {
    console.warn("Gemini AI extraction fallback triggered due to API error or limit:", error);
    return getFallbackData();
  }
};