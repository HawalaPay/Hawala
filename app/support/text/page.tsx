'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitSupportRequest, SupportRequest, SupportResponse } from '@/api/text-support';
import '@/styles/text.css';

export default function SupportFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SupportRequest>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<SupportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmittedData, setLastSubmittedData] = useState<SupportRequest | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Store a copy of the current form data before submission
    const currentSubmission = { ...formData };
    setLastSubmittedData(currentSubmission);
    
    try {
      const result = await submitSupportRequest(formData);

      if (result.success) {
        setResponse(result);
        
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          description: ''
        });
      } else {
        throw new Error(result.error || result.analysis?.solution || 'Failed to submit support request');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/support');
  };

  // Use this function to safely get request data (either from response or lastSubmittedData)
  const getRequestData = () => {
    if (response?.requestData) {
      return response.requestData;
    }
    return lastSubmittedData || formData;
  };

  // Get the request data safely
  const requestData = getRequestData();

  return (
    <div className="support-container">
      <h1 className="support-title">Submit a Support Request</h1>
      
      {response ? (
        <div className="response-container">
          <h2 className="response-header">Request Submitted Successfully</h2>
          
          <div className="ticket-section">
            <h3 className="section-title">Ticket Information</h3>
            <div className="ticket-info">
              <p><strong>Ticket ID:</strong> {response.ticketId}</p>
            </div>
          </div>
          
          <div className="understanding-section">
            <h3 className="section-title">Your Request Details</h3>
            <div className="understanding-content">
              <div className="request-details-grid">
                <p><strong>Name:</strong> {requestData.name}</p>
                <p><strong>Email:</strong> {requestData.email}</p>
              </div>
              <div className="request-details-grid">
                <p><strong>Phone:</strong> {requestData.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> {requestData.subject || 'Not provided'}</p>
              </div>
              <p><strong>Description:</strong></p>
              <p className="description-content">{requestData.description}</p>
            </div>
          </div>
          
          <div className="solution-section">
            <h3 className="section-title">Our Response</h3>
            <div className="solution-content">
              <p>{response.analysis?.solution || "Thank you for contacting us. We've received your request and will respond shortly."}</p>
            </div>
          </div>
          
          <div className="next-steps-section">
            <h3 className="section-title">Next Steps</h3>
            <div className="next-steps-content">
              <p>
                We have scheduled a call with one of our support specialists to discuss your request in detail.
                {requestData.phone ? ` Our team will call you at ${requestData.phone} shortly.` : ' Please expect a call from our team soon.'}
              </p>
            </div>
          </div>
          
          <div className="footer-section">
            <button
              onClick={handleBackToHome}
              className="back-link"
            >
              Back to Support Options
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 9881679994"
              className="form-input"
            />
            <p className="form-hint">
              If provided, our support team will call you to discuss your issue.
            </p>
          </div>
          
          <div className="form-field">
            <label htmlFor="subject" className="form-label">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="form-textarea"
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={handleBackToHome}
              className="back-button"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`send-button ${isSubmitting ? 'sending' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}