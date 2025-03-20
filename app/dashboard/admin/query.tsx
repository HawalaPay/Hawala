'use client';


import React, { useState, useEffect } from 'react';
import { fetchCustomerTickets, CustomerTicket } from '@/api/get-queries';
import { Search, Users, Headphones, BriefcaseBusiness, PiggyBank, ShieldAlert, Filter } from 'lucide-react';

const CustomerTicketDashboard = () => {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerTickets();
        setTickets(data);
        setError(null);
      } catch (err) {
        setError('Failed to load customer tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  const departments = ['Support', 'Services', 'Loans', 'Scam', 'All'];
  
  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Support':
        return <Headphones className="w-5 h-5" />;
      case 'Services':
        return <BriefcaseBusiness className="w-5 h-5" />;
      case 'Loans':
        return <PiggyBank className="w-5 h-5" />;
      case 'Scam':
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-black text-white';
      case 'Medium':
        return 'bg-gray-500 text-white';
      case 'Low':
        return 'bg-gray-200 text-black';
      default:
        return 'bg-gray-100';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Department filter
    if (activeFilter && activeFilter !== 'All' && ticket.Department !== activeFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket["Customer ID"].toLowerCase().includes(query) ||
        ticket.Name.toLowerCase().includes(query) ||
        ticket.Subject.toLowerCase().includes(query) ||
        ticket.Query.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Ticket Dashboard</h1>
      
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`flex items-center gap-2 px-3 py-2 border ${
                activeFilter === dept || (dept === 'All' && !activeFilter)
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:bg-gray-100'
              } rounded`}
              onClick={() => setActiveFilter(dept === 'All' ? null : dept)}
            >
              {dept !== 'All' ? getDepartmentIcon(dept) : <Filter className="w-5 h-5" />}
              {dept}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-10">
          <p>Loading tickets...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
        </div>
      )}
      
      {/* No results */}
      {!loading && !error && filteredTickets.length === 0 && (
        <div className="text-center py-10 border border-gray-200 rounded">
          <p>No tickets found.</p>
        </div>
      )}
      
      {/* Ticket list */}
      {!loading && !error && filteredTickets.length > 0 && (
        <div className="grid gap-4">
          {filteredTickets.map((ticket, index) => (
            <div key={index} className="border border-gray-200 rounded p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  {getDepartmentIcon(ticket.Department)}
                  <span className="font-bold">{ticket.Department}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(ticket.Priority)}`}>
                    {ticket.Priority}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>Customer: {ticket.Name} ({ticket["Customer ID"]})</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{ticket.Subject}</h3>
              <p className="mb-3 text-gray-700">{ticket.Query}</p>
              
              <div className="bg-gray-50 p-3 rounded mt-2">
                <p className="text-sm font-medium">Solution:</p>
                <p className="text-sm">{ticket.Solution}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded">Channel: {ticket.Channel}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Solveable: {ticket.Solveable}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Language: {ticket.Language}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerTicketDashboard;