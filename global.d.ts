import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  // Define the Ethereum interface based on MetaMask's provider type
  interface Ethereum extends MetaMaskInpageProvider {
    isMetaMask?: boolean;
  }

  // Extend the Window interface to include the Ethereum property
  interface Window {
    ethereum?: Ethereum; // Unified type declaration for `ethereum`
  }
}

export {};

// Module declarations for the Button component
declare module "@/components/ui/button" {
  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
      asChild?: boolean;
    } & React.RefAttributes<HTMLButtonElement>
  >;
}

// Module declarations for the Alert components
declare module "@/components/ui/alert" {
  export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
}
