import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminViewContextType {
  viewingAsCompanyId: string | null;
  viewingAsCompanyName: string | null;
  setViewingAs: (companyId: string | null, companyName: string | null) => void;
  isViewingAsOther: boolean;
  clearViewingAs: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({
  viewingAsCompanyId: null,
  viewingAsCompanyName: null,
  setViewingAs: () => {},
  isViewingAsOther: false,
  clearViewingAs: () => {},
});

export const useAdminView = () => useContext(AdminViewContext);

export const AdminViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewingAsCompanyId, setViewingAsCompanyId] = useState<string | null>(
    () => sessionStorage.getItem('viewing_as_company_id')
  );
  const [viewingAsCompanyName, setViewingAsCompanyName] = useState<string | null>(
    () => sessionStorage.getItem('viewing_as_company_name')
  );

  const setViewingAs = (companyId: string | null, companyName: string | null) => {
    setViewingAsCompanyId(companyId);
    setViewingAsCompanyName(companyName);
    if (companyId) {
      sessionStorage.setItem('viewing_as_company_id', companyId);
      sessionStorage.setItem('viewing_as_company_name', companyName || '');
    } else {
      sessionStorage.removeItem('viewing_as_company_id');
      sessionStorage.removeItem('viewing_as_company_name');
    }
  };

  const clearViewingAs = () => setViewingAs(null, null);

  return (
    <AdminViewContext.Provider value={{
      viewingAsCompanyId,
      viewingAsCompanyName,
      isViewingAsOther: !!viewingAsCompanyId,
      setViewingAs,
      clearViewingAs,
    }}>
      {children}
    </AdminViewContext.Provider>
  );
};
