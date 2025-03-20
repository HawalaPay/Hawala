import "@/styles/text.css"
export interface SupportRequest {
    name: string;
    email: string;
    phone: string;
    subject: string;
    description: string;
  }
  
  export interface GroqAnalysisResponse {
    category: string;
    priority: string;
    department: string;
    language: string;
    solveable: string;
    solution: string;
  }
  
  export interface SupportResponse {
    success: boolean;
    ticketId: string;
    analysis?: GroqAnalysisResponse;
    requestData: SupportRequest; // Added to return request data to frontend
    error?: string;
  }
  
  // Function to analyze support request using Groq
  async function analyzeWithGroq(request: SupportRequest): Promise<GroqAnalysisResponse> {
    try {
      const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      
      if (!groqApiKey) {
        throw new Error('Groq API key is not defined');
      }
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are a professional bank customer support agent. Analyze the customer support request and provide appropriate categorization and solution. 
              For solveable, answer ONLY with "Yes" or "No".
              For priority, answer ONLY with "High", "Medium", or "Low".
              For department, answer ONLY with "Loans", "Scam", "Inquiry", or "Services".
              Always respond in the same language as the customer's query.
              
              Respond ONLY with a JSON object in the following format:
              {
                "category": "Account|Technical|Billing|Product|Other",
                "priority": "High|Medium|Low",
                "department": "Loans|Scam|Inquiry|Services",
                "language": "English|Spanish|French|etc",
                "solveable": "Yes|No",
                "solution": "Clear and concise solution or next steps. make it detailed and easily understandable."
              }`
            },
            {
              role: "user",
              content: `Customer: ${request.name}
              Phone: ${request.phone}
              Subject: ${request.subject}
              Description: ${request.description}`
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        })
      });
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Groq API error: ${data.error.message}`);
      }
      
      // Parse the JSON response from Groq
      const contentString = data.choices?.[0]?.message?.content || '';
      const jsonMatch = contentString.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to parse JSON response from Groq');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing with Groq:', error);
      throw error;
    }
  }
  
  // Function to save data to Google Sheets via AppScript
  async function saveToGoogleSheets(request: SupportRequest, analysis: GroqAnalysisResponse, ticketId: string): Promise<boolean> {
    try {
      const customerId = ticketId;
      
      // Fix: Use direct URL with all parameters
      const baseUrl = 'https://script.google.com/macros/s/AKfycbwEtIaGxm-3Ff-iZM4_Fuys8x4BKYf9kadN1B1oadMenS9ATzdHCOcgqpuwGhZa4OQJQA/exec';
      
      // URL encode all parameters
      const params = new URLSearchParams();
      params.append('action', 'put');
      params.append('CustomerID', customerId);
      params.append('Name', request.name);
      params.append('Channel', 'Form');
      params.append('Subject', request.subject);
      params.append('Query', request.description);
      params.append('Solution', analysis.solution);
      params.append('Solveable', analysis.solveable);
      params.append('Priority', analysis.priority);
      params.append('Department', analysis.department);
      params.append('Language', analysis.language);
      params.append('Phone', request.phone);
      
      // Create direct URL string with all parameters
      const fullUrl = `${baseUrl}?${params.toString()}`;
      
      // Use simple GET request
      const response = await fetch(fullUrl);
      
      // FIX: Handle plain text response instead of expecting JSON
      const responseText = await response.text();
      
      // Check if the response contains success indicators
      // Google Scripts might return "Data added successfully" or similar text
      return responseText.includes("success") || 
             responseText.includes("Success") || 
             responseText.includes("Data added") || 
             responseText.includes("Updated");
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      return false;
    }
  }
  
  // Function to make a phone call using Bland.ai - ALWAYS call the customer
  async function makePhoneCall(request: SupportRequest, analysis: GroqAnalysisResponse): Promise<boolean> {
    try {
      // You would need to set up a BLAND_AI_API_KEY in your environment variables
      const blandApiKey = process.env.BLAND_AI_API_KEY;
      
      if (!blandApiKey) {
        throw new Error('Bland.ai API key is not defined');
      }
      
      // Format the phone number to E.164 format
      const formattedPhone = request.phone.replace(/\D/g, '');
      if (!formattedPhone || formattedPhone.length < 10) {
        throw new Error('Invalid phone number');
      }
      
      const phoneWithCountryCode = formattedPhone.startsWith('1') ? 
        `+${formattedPhone}` : `+91${formattedPhone}`;
      
      // Prepare message in the customer's language
      const response = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${blandApiKey}`
        },
        body: JSON.stringify({
          phone_number: phoneWithCountryCode,
          task: `You're a bank support representative. The customer ${request.name} has submitted a support request about: ${request.subject}. Their issue is: ${request.description}. Based on our analysis, the recommended solution is: ${analysis.solution}. Call them to follow up and provide this solution. Speak to them in ${analysis.language}. Make it Natural.`,
          voice: 'nicole',
          reduce_latency: true,
          wait_for_greeting: true
        })
      });
      
      const result = await response.json();
      return !!result.call_id;
    } catch (error) {
      console.error('Error making phone call with Bland.ai:', error);
      return false;
    }
  }
  
  // Main function to handle support requests
  export async function submitSupportRequest(request: SupportRequest): Promise<SupportResponse> {
    try {
      // Generate ticket ID
      const ticketId = `BANK-${Date.now().toString().slice(-6)}`;
      
      // Step 1: Analyze the request with Groq
      const analysis = await analyzeWithGroq(request);
      
      // Step 2: Save data to Google Sheets
      const sheetResult = await saveToGoogleSheets(request, analysis, ticketId);
      
      // Step 3: ALWAYS make phone call using Bland.ai
      let callResult = false;
      try {
        callResult = await makePhoneCall(request, analysis);
      } catch (callError) {
        console.error('Phone call failed, but continuing with process:', callError);
        // Don't throw here, continue with process even if call fails
      }
      
      // Return success response with ticket ID, analysis, and the original request data
      return {
        success: sheetResult,
        ticketId,
        analysis,
        requestData: request // Include the original request data
      };
    } catch (error) {
      console.error('Error submitting support request:', error);
      return {
        success: false,
        ticketId: '',
        requestData: request, // Include the original request data even on error
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }