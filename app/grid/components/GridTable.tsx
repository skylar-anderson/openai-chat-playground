import type { GridPrimaryCell, GridState, GridCol, GridCell } from "../actions";
import { useGridContext } from "./GridContext";
import Cell from "./Cell";
import NewColumnForm from "./NewColumnForm";
import "./Grid.css";

type Props = {
  grid: GridState;
  addNewColumn: ({
    title,
    instructions,
  }: {
    title: string;
    instructions: string;
  }) => void;
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

type PrimaryColumnProps = {
  primaryColumn: GridPrimaryCell[];
  title: string;
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

export function PrimaryColumn({
  primaryColumn,
  title,
  selectRow,
  selectedIndex,
}: PrimaryColumnProps) {
  return (
    <div className="grid-col grid-col--primary">
      <div className="grid-cell grid-cell--header">{title}</div>
      {primaryColumn.map((cell: GridPrimaryCell, cellIndex: number) => (
        <div
          className={`grid-cell ${
            selectedIndex === cellIndex ? "grid-cell--selected" : ""
          }`}
          key={cellIndex}
          onClick={() => {
            selectRow(cellIndex);
          }}
        >
          <div className="cell-value">{cell.displayValue}</div>
        </div>
      ))}
    </div>
  );
}

export default function GridTable() {
  const { gridState, addNewColumn, selectRow, selectedIndex } =
    useGridContext();
  if (!gridState) {
    return null;
  }
  const { columns, title, primaryColumn, primaryColumnType } = gridState;

  return (
    <div className="grid">
      <div className="grid-title">{title}</div>
      <div className="grid-columns">
        <PrimaryColumn
          primaryColumn={primaryColumn}
          title={primaryColumnType}
          selectRow={selectRow}
          selectedIndex={selectedIndex}
        />
        {columns.map((column: GridCol, rowIndex: number) => (
          <div className="grid-col" key={rowIndex}>
            <div
              className="grid-cell grid-cell--header"
              title={column.instructions}
            >
              {column.title}
            </div>
            {column.cells.map((cell: GridCell, cellIndex: number) => (
              <Cell
                cell={cell}
                key={cellIndex}
                isSelected={selectedIndex === cellIndex}
              />
            ))}
          </div>
        ))}
        <NewColumnForm addNewColumn={addNewColumn} />
      </div>
    </div>
  );
}
