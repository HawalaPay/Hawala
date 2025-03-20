"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextDate: string;
  category: string;
}

interface FormDataType {
  name: string;
  amount: string;
  frequency: string;
  nextDate: string;
  category: string;
}

export default function RecurringTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, name: 'Netflix Subscription', amount: 199, frequency: 'Monthly', nextDate: '25/03/2025', category: 'Entertainment' },
    { id: 2, name: 'Gym Membership', amount: 1200, frequency: 'Monthly', nextDate: '01/04/2025', category: 'Health' },
    { id: 3, name: 'Electricity Bill', amount: 2800, frequency: 'Monthly', nextDate: '10/04/2025', category: 'Utilities' },
    { id: 4, name: 'SIP Investment', amount: 5000, frequency: 'Monthly', nextDate: '05/04/2025', category: 'Investments' },
    { id: 5, name: 'Internet Bill', amount: 999, frequency: 'Monthly', nextDate: '15/04/2025', category: 'Utilities' },
  ]);

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    amount: '',
    frequency: 'Monthly',
    nextDate: '',
    category: 'Bills'
  });

  const chartData = [
    { month: 'Jan', amount: 8500 },
    { month: 'Feb', amount: 10200 },
    { month: 'Mar', amount: 9800 },
    { month: 'Apr', amount: 11500 },
    { month: 'May', amount: 10800 },
    { month: 'Jun', amount: 9500 },
  ];

  const categoryData = [
    { category: 'Bills', amount: 3799 },
    { category: 'Entertainment', amount: 199 },
    { category: 'Health', amount: 1200 },
    { category: 'Investments', amount: 5000 },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      name: formData.name,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      category: formData.category
    };
    setTransactions([...transactions, newTransaction]);
    setFormData({
      name: '',
      amount: '',
      frequency: 'Monthly',
      nextDate: '',
      category: 'Bills'
    });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Recurring Transactions Dashboard</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
            <div className="text-3xl font-bold">₹10,198</div>
            <div className="text-sm text-gray-500">Total recurring payments</div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Next Payment</h2>
            <div className="text-3xl font-bold">₹1,200</div>
            <div className="text-sm text-gray-500">Gym Membership - 01/04/2025</div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Total Transactions</h2>
            <div className="text-3xl font-bold">{transactions.length}</div>
            <div className="text-sm text-gray-500">Active recurring transactions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Spending Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Line type="monotone" dataKey="amount" stroke="#000000" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="amount" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Recurring Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">Transaction Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="frequency" className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-yearly">Half-yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="nextDate" className="block text-sm font-medium mb-1">Next Due Date</label>
                <input
                  type="text"
                  id="nextDate"
                  name="nextDate"
                  placeholder="DD/MM/YYYY"
                  value={formData.nextDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Health">Health</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Investments">Investments</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors">
                Add Transaction
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Active Recurring Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Name</th>
                    <th className="py-2 text-left">Amount</th>
                    <th className="py-2 text-left">Frequency</th>
                    <th className="py-2 text-left">Next Date</th>
                    <th className="py-2 text-left">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b">
                      <td className="py-3">{transaction.name}</td>
                      <td className="py-3">₹{transaction.amount.toLocaleString()}</td>
                      <td className="py-3">{transaction.frequency}</td>
                      <td className="py-3">{transaction.nextDate}</td>
                      <td className="py-3">{transaction.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}