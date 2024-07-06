"use client"

import type { SuccessfulPrimaryColumnResponse, ErrorResponse, GridState, GridCell, GridCol } from "../actions";
import { GridProvider, useGridContext } from "./GridContext";
import React, { useState } from "react";
import GridTable from "./GridTable";
import SelectedContext from "./SelectedContext";
import GridIntroForm from "./GridIntroForm";

import './Grid.css';

type Props = {
  createPrimaryColumn: (s: string) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>,
  hydrateCell: (s: GridCell) => Promise<{ promise: Promise<GridCell> }>
}

function GridContent() {
  const { gridState } = useGridContext();
  return (
    <div className="grid-app">
      {gridState ? (
        <div className="grid-layout">
          <GridTable />
          <SelectedContext />
        </div>
      ) : (
        <div>
          <GridIntroForm />
        </div>
      )}
    </div>
  );
}

export default function Grid(props: Props) {
  return (
    <GridProvider hydrateCell={props.hydrateCell} createPrimaryColumn={props.createPrimaryColumn}>
      <GridContent />
    </GridProvider>
  );
}