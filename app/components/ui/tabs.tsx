import React, { useState } from "react";

type Tab = {
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
};

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="w-full">
      {/* Tabs List */}
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <TabsTrigger
            key={index}
            isActive={index === activeTab}
            onClick={() => handleTabClick(index)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <TabsContent>{tabs[activeTab].content}</TabsContent>
      </div>
    </div>
  );
};

type TabsTriggerProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 text-sm font-medium ${
      isActive
        ? "border-b-2 border-blue-500 text-blue-500"
        : "text-gray-600 hover:text-blue-500"
    }`}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
