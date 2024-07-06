import React, { createContext, useContext, ReactNode, useState } from 'react';
import { GridState, GridCell } from '../actions';

type GridContextType = {
  gridState: GridState | null;
  setGridState: (gridState: GridState | null) => void;
  selectRow: (index: number | null) => void;
  updateCellState: (columnTitle: string, cellIndex: number, newCellContents: GridCell) => void;
};

const GridContext = createContext<GridContextType | undefined>(undefined);

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error('useGridContext must be used within a GridProvider');
  }
  return context;
};

export const GridProvider = ({ children }: { children: ReactNode }) => {
  const [gridState, setGridState] = useState<GridState | null>(null);

  const selectRow = (index: number | null) => {
    console.log('Select row:', index);
  };

  const updateCellState = (columnTitle: string, cellIndex: number, newCellContents: GridCell) => {
    console.log('Update cell state:', columnTitle, cellIndex, newCellContents);
  };

  return (
    <GridContext.Provider value={{ gridState, setGridState, selectRow, updateCellState }}>
      {children}
    </GridContext.Provider>
  );
};