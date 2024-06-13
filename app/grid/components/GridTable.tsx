import type { GridPrimaryCell, GridState, GridCol, GridCell} from "../actions";
import Cell from "./Cell";
import NewColumnForm from "./NewColumnForm";
import './Grid.css';

type Props = {
  grid:GridState;
  addNewColumn: (s:string) => void;
  selectRow: (n:number) => void;
  selectedIndex: number|null;
}

type PrimaryColumnProps = {
  primaryColumn: GridPrimaryCell[];
  title: string;
  selectRow: (n:number) => void;
  selectedIndex: number|null;
}

export function PrimaryColumn({ primaryColumn, title, selectRow, selectedIndex }:PrimaryColumnProps) {
  return (
    <div className="grid-col grid-col--primary">
      <div className="grid-cell grid-cell--header">{title}</div>
      {primaryColumn.map((cell:GridPrimaryCell, cellIndex:number) => (
        <div className={`grid-cell ${selectedIndex===cellIndex ? 'grid-cell--selected' : ''}`} key={cellIndex} onClick={() => { selectRow(cellIndex)}}>
          <div className="cell-value">{cell.displayValue}</div>
        </div>
      ))}
    </div>
  )
}

export default function GridTable({grid, addNewColumn, selectRow, selectedIndex }:Props) {
  return (
    <div className="grid">
      <div className="grid-title">{grid.title}</div>
      <div className="grid-columns">
        <PrimaryColumn primaryColumn={grid.primaryColumn} title={grid.primaryColumnType} selectRow={selectRow} selectedIndex={selectedIndex}/>
        {grid.columns.map((column:GridCol, rowIndex:number) => (
          <div className="grid-col" key={rowIndex}>
            <div className="grid-cell grid-cell--header">{column.key}</div>
            {column.cells.map((cell:GridCell, cellIndex:number) => (
              <Cell cell={cell} key={cellIndex} isSelected={selectedIndex === cellIndex} />
            ))}
          </div>
        ))}
        <NewColumnForm gridState={grid} addNewColumn={addNewColumn} />
      </div>
    </div>
  );
}