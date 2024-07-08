import { GridCell } from "../actions";

type Props = {
  cell: GridCell;
  isSelected: boolean;
};

export default function Cell({ cell, isSelected }: Props) {
  return (
    <div className={`grid-cell ${isSelected ? "grid-cell--selected" : ""}`}>
      {cell.state !== "done" && <div className="cell-state">{cell.state}</div>}
      <div className="cell-value">{cell.displayValue}</div>
    </div>
  );
}
