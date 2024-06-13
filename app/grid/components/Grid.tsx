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

  function addNewColumnHandler(title:string) {
    if (!gridState) {
      alert("Cant add column without grid state!");
      return;
    }

    const newColumn:GridCol = {
      key: title,
      cells: gridState.primaryColumn.map(primaryCell => ({ state: 'empty', key: title, displayValue: 'loading...', context: primaryCell.context, primaryColumnType: 'issue' }))
    }
    setGridState({
      ...gridState,
      columns: [...gridState.columns, newColumn]
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
            hydrateCell={hydrateCell}
            selectRow={selectRow}
          />
          {selectedIndex ? <SelectedContext grid={gridState} index={selectedIndex} /> : null}
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
