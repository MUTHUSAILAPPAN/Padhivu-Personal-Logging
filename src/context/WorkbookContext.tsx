import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { workbookReducer, initialWorkbookState } from './workbookReducer';
import type { WorkbookState, WorkbookAction } from './workbookReducer';

export interface WorkbookContextProps {
  state: WorkbookState;
  dispatch: React.Dispatch<WorkbookAction>;
}

export const WorkbookContext = createContext<WorkbookContextProps | undefined>(undefined);

interface WorkbookProviderProps {
  children: ReactNode;
}

export const WorkbookProvider: React.FC<WorkbookProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(workbookReducer, initialWorkbookState);

  return (
    <WorkbookContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkbookContext.Provider>
  );
};
