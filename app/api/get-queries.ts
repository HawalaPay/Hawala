// api.ts
export interface CustomerTicket {
    "Customer ID": string;
    "Name": string;
    "Channel": string;
    "Subject": string;
    "Query": string;
    "Solution": string;
    "Solveable": "Yes" | "No";
    "Priority": "High" | "Medium" | "Low";
    "Department": string;
    "Language": string;
  }
  
  // Store the last API response
  let lastApiResponse: CustomerTicket[] | null = null;
  
  export const fetchCustomerTickets = async (): Promise<CustomerTicket[]> => {
    try {
      // If we have a cached response, return it immediately
      if (lastApiResponse) {
        console.log("Returning cached response");
        return [...lastApiResponse]; // Return a copy to prevent mutations
      }
  
      const API_URL = "https://script.google.com/macros/s/AKfycbwEtIaGxm-3Ff-iZM4_Fuys8x4BKYf9kadN1B1oadMenS9ATzdHCOcgqpuwGhZa4OQJQA/exec?action=get";
      
      const response = await fetch(API_URL, {
        method: "GET",
        mode: 'cors'
      });
      
      // Handle network errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verify content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error("Received non-JSON response");
      }
      
      const data: CustomerTicket[] = await response.json();
      
      // Cache the response for future calls
      lastApiResponse = data;
      
      return data;
    } catch (error) {
      console.error("Error fetching customer tickets:", error);
      
      // If we have a cached response, return it even if the current request failed
      if (lastApiResponse) {
        console.warn("Returning cached response after fetch error");
        return [...lastApiResponse];
      }
      
      throw new Error("Failed to load customer tickets. Please check your connection and try again.");
    }
  }
  
  // Add a function to clear the cache if needed
  export const clearCustomerTicketsCache = (): void => {
    lastApiResponse = null;
    console.log("Customer tickets cache cleared");
  }
  
  // Function to fetch fresh data and ignore cache
  export const refreshCustomerTickets = async (): Promise<CustomerTicket[]> => {
    lastApiResponse = null; // Clear cache first
    return fetchCustomerTickets(); // Then fetch fresh data
  }