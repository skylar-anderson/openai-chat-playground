"use client"

import type { SuccessfulPrimaryColumnResponse, ErrorResponse, GridState, GridCell, GridCol } from "../actions";
import React, { useState } from "react";
import GridTable from "./GridTable";
import SelectedContext from "./SelectedContext";
import './Grid.css';

type Props = {
  createPrimaryColumn:(s:string) => Promise<SuccessfulPrimaryColumnResponse|ErrorResponse>,
  hydrateCell:(s:GridCell) => Promise<{ promise: Promise<GridCell>}>
}

export default function Grid({createPrimaryColumn, hydrateCell }:Props) {
  const [gridState, setGridState] = useState<GridState|null>(null);
  const [ state, setState] = useState<'empty'|'loading'|'done'>('empty');
  const [inputValue, setInputValue] = useState<string>('open issues in primer/react');
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<number|null>(null);

  function selectRow(index:number) {
    if (!gridState) {
      alert("Cant select column without grid state!");
      return;
    }

    setSelectedIndex(index);
  }

  function updateCellState(columnKey:string, cellIndex:number, newCellContents:GridCell) {
    setGridState((prevState) => {
      if (prevState === null) { return null }
      return {
        ...prevState,
        columns: prevState.columns.map(column => {
          if (column.key === columnKey) {
            return {
              ...column,
              cells: column.cells.map((c, i) => {
                if (i === cellIndex) {
                  return newCellContents;
                }
                return c;
              })
            }
          }
          return column;
        })
      }
    });
  }

  function addNewColumnHandler(title:string) {
    if (!gridState) {
      alert("Cant add column without grid state!");
      return;
    }

    const newColumn:GridCol = {
      key: title,
      cells: gridState.primaryColumn.map(primaryCell => {
        const staticValue = primaryCell.context[title];
        const emptyCellState:GridCell = {
          state: staticValue ? 'done' : 'empty',
          displayValue: staticValue || '',
          key: title,
          context: primaryCell.context,
          primaryColumnType: 'issue',
          hydrationSources: []
        }

        return emptyCellState;
      })
    }

    setGridState({
      ...gridState,
      columns: [...gridState.columns, newColumn]
    });

    newColumn.cells.forEach((cell, cellIndex) => {
      if (cell.state !== 'empty') { return; }
      hydrateCell(cell).then(c => c.promise).then(hydratedCell => {
        updateCellState(title, cellIndex, hydratedCell)
      });
    });
  }

  async function createPrimaryColumnHandler() {
    if (!inputValue) {
      alert('Please enter a value');
      return;
    }

    setState('loading');
    const response = await createPrimaryColumn(inputValue);
    if (response.success) {
      setGridState(response.grid);
    } else {
      setErrorMessage(response.message);
    }
    
    setState('done');
  }

  return (
    <div className="grid-app">
      {gridState ? (
        <div className="grid-layout">
          <GridTable
            grid={gridState}
            addNewColumn={addNewColumnHandler}
            selectedIndex={selectedIndex}
            selectRow={selectRow}
          />
          {selectedIndex !== null ? <SelectedContext grid={gridState} index={selectedIndex} selectRow={selectRow} /> : null}
        </div>
      ) : (
        <div>
          {state === 'loading' ? (
            "Starting grid..."
          ) : (
            <div>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              <input
                className="input"
                type='text'
                placeholder='e.g. open issues in primary/react'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <button className='button' onClick={createPrimaryColumnHandler}>
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
