import React from "react";
import { User } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { UIButton } from "@/components/ui/button";

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => (
  <div className="relative">
    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Search contacts..."
      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

const RecentContacts = ({ contacts }: { contacts: any[] }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Recent Contacts</CardTitle>
        <UIButton variant="ghost" className="text-sm gap-2">
          View All
        </UIButton>
      </div>
      <div className="mt-4">
        <SearchBar onSearch={(query) => console.log(query)} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {contacts.map((contact, i) => (
          <div
            key={i}
            className="flex flex-col items-center space-y-2 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white group-hover:border-gray-200 transition-all shadow-sm">
                {contact.image ? (
                  <img
                    src={contact.image}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              {contact.amount && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-0.5 text-xs font-medium border shadow-sm">
                  Rs {contact.amount}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {contact.name}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RecentContacts;
