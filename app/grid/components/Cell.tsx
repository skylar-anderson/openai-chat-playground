import { useState, useEffect } from 'react'
import { GridCell } from '../actions';

export default function Cell({ cell, hydrate }: { cell: GridCell, hydrate:(s:GridCell) => Promise<{ promise: Promise<GridCell> } > }) {
  const [cellState, setCellState] = useState<GridCell>(cell);
  
  useEffect(() => {
    const hydrateCell = async () => {
      const hydratePromise = await hydrate(cell);
      const hydratedCellState = await hydratePromise.promise;
      setCellState({
        ...cellState,
        ...hydratedCellState
      });
    };
    
    setCellState({
      ...cellState,
      state: 'generating'
    });

    if (cellState.context[cellState.key]) {
      setCellState({
        ...cellState,
        state: 'done',
        displayValue: cellState.context[cellState.key]
      });
    } else {
      hydrateCell();
    }
  }, [cell.key]);

  return (
    <div className="grid-cell">
      <div className="cell-state">{cellState.state}</div>
      <div className="cell-value">{cellState.displayValue}</div>
    </div>
  );
}