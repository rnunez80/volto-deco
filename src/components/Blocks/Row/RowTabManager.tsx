import React from 'react';

interface RowTabManagerProps {
  selected?: boolean;
  type?: string;
}

/**
 * RowTabManager is now a no-op because the Row tab is natively registered
 * in Sidebar.jsx as a first-class Semantic UI tab, managed via Redux.
 */
const RowTabManager: React.FC<RowTabManagerProps> = () => {
  return null;
};

export default RowTabManager;
