import { useState } from 'react';
import { GridState } from '../actions';
import './SelectedContext.css';
import './Button.css';

type Props = {
  index: number;
  grid: GridState;
  selectRow: (n:number) => void;
}

export default function SelectedContext({ index, grid, selectRow }:Props) {
  const primaryColumn = grid.primaryColumn
  const primaryCell = primaryColumn[index];
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  function previousRow() {
    const targetRow = index === 0 ? grid.primaryColumn.length - 1 : index - 1;
    selectRow(targetRow);
  }

  function nextRow() {
    const targetRow = index === grid.primaryColumn.length - 1 ? 0 : index + 1;
    selectRow(targetRow);
  }

  return (
    <div className="selected-context">
      <div className="header">
        <div className="header-nav">
          <button className="button next-prev" onClick={previousRow}>↑</button>
          <button className="button next-prev" onClick={nextRow}>↓</button>
        </div>
        <div className="header-title">
          {primaryCell.displayValue}
        </div>
        <button className="header-close">Close</button>
      </div>

      <div className="body">
        {grid.columns.map((c,i) => (
          <div className="selected-context-section" key={`context-${i}`}>
            <h3 className="section-title">{c.key}</h3>
            <p className="display-value">{c.cells[index].displayValue}</p>
            {c.cells[index].hydrationSources.length > 0 && (
              <div className="sources">Used {c.cells[index].hydrationSources.join(', ')}</div>
            )}
          </div>
        ))}

        {showDetails ? (
          <div className="details details--open">
            <button className="button" onClick={() => setShowDetails(false)}>Hide details</button>
            {Object.keys(primaryCell.context).map(k => {
              const value = primaryCell.context[k];
              return (
                <div className="selected-context-section" key={k}>
                  <h3 className="section-title">{k}</h3>
                  <p className="display-value">{primaryCell.context[k]}</p>
                </div>
              )
            })}
          </div>
        ):(
          <button className="button" onClick={() => setShowDetails(true)}>Show {primaryCell.context.type} details</button>
        )}
      </div>
    </div>
  )
}

