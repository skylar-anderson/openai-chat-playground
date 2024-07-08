import React, { createContext, useContext, ReactNode, useState } from "react";
import {
  SuccessfulPrimaryColumnResponse,
  ErrorResponse,
  GridState,
  GridCell,
} from "../actions";
import type { GridCol } from "../actions";

type GridContextType = {
  gridState: GridState | null;
  setGridState: React.Dispatch<React.SetStateAction<GridState | null>>;
  selectRow: (index: number | null) => void;
  updateCellState: (
    columnTitle: string,
    cellIndex: number,
    newCellContents: GridCell,
  ) => void;
  addNewColumn: (props: NewColumnProps) => void;
  inititializeGrid: (s: string) => Promise<void>;
  selectedIndex: number | null;
};

type NewColumnProps = {
  title: string;
  instructions: string;
};

const GridContext = createContext<GridContextType | undefined>(undefined);

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error("useGridContext must be used within a GridProvider");
  }
  return context;
};

type ProviderProps = {
  hydrateCell: (cell: GridCell) => Promise<{ promise: Promise<GridCell> }>;
  createPrimaryColumn: (
    s: string,
  ) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>;
  children: ReactNode;
};

export const GridProvider = ({
  createPrimaryColumn,
  hydrateCell,
  children,
}: ProviderProps) => {
  const [gridState, setGridState] = useState<GridState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  async function inititializeGrid(title: string) {
    const result = await createPrimaryColumn(title);
    if (!result.success) {
      throw new Error(result.message);
    }

    setGridState(result.grid);
  }

  const selectRow = (index: number | null) => {
    if (!gridState) {
      console.warn("Can't select row without grid state!");
      return;
    }
    setSelectedIndex(index);
  };

  function addNewColumn({ title, instructions }: NewColumnProps) {
    if (!gridState) {
      alert("Can't add column without grid state!");
      return;
    }

    const newColumn: GridCol = {
      title,
      instructions,
      cells: gridState.primaryColumn.map((primaryCell) => {
        const staticValue = primaryCell.context[title];
        const emptyCellState: GridCell = {
          state: staticValue ? "done" : "empty",
          displayValue: staticValue || "",
          columnTitle: title,
          columnInstructions: instructions,
          context: primaryCell.context,
          hydrationSources: [],
        };

        return emptyCellState;
      }),
    };

    setGridState({
      ...gridState,
      columns: [...gridState.columns, newColumn],
    });

    newColumn.cells.forEach((cell, cellIndex) => {
      if (cell.state !== "empty") {
        return;
      }
      hydrateCell(cell)
        .then((c) => c.promise)
        .then((hydratedCell) => {
          updateCellState(title, cellIndex, hydratedCell);
        });
    });
  }

  const updateCellState = (
    columnTitle: string,
    cellIndex: number,
    newCellContents: GridCell,
  ) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        columns: prevState.columns.map((column) => {
          if (column.title === columnTitle) {
            return {
              ...column,
              cells: column.cells.map((c, i) => {
                if (i === cellIndex) {
                  return newCellContents;
                }
                return c;
              }),
            };
          }
          return column;
        }),
      };
    });
  };

  return (
    <GridContext.Provider
      value={{
        inititializeGrid,
        selectedIndex,
        gridState,
        setGridState,
        selectRow,
        updateCellState,
        addNewColumn,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};
