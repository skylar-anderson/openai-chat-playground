import { useState } from "react";
import { GridState } from "../actions";
import { useGridContext } from "./GridContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./SelectedContext.css";
import "./Button.css";

export default function SelectedContext() {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  if (!gridState) {
    return null;
  }
  if (selectedIndex === null) {
    return null;
  }

  const { columns } = gridState;

  const primaryColumn = gridState.primaryColumn;
  const primaryCell = primaryColumn[selectedIndex];
  const [showDetails, setShowDetails] = useState<boolean>(false);

  function previousRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow =
      selectedIndex === 0 ? primaryColumn.length - 1 : selectedIndex - 1;
    selectRow(targetRow);
  }

  function nextRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow =
      selectedIndex === primaryColumn.length - 1 ? 0 : selectedIndex + 1;
    selectRow(targetRow);
  }

  return (
    <div className="selected-context">
      <div className="header">
        <div className="header-nav">
          <button className="button next-prev" onClick={previousRow}>
            ↑
          </button>
          <button className="button next-prev" onClick={nextRow}>
            ↓
          </button>
        </div>
        <div className="header-title">{primaryCell.displayValue}</div>
        <button className="header-close" onClick={() => selectRow(null)}>
          Close
        </button>
      </div>

      <div className="body">
        {columns.map((c, i) => (
          <div className="selected-context-section" key={`context-${i}`}>
            <h3 className="section-title" title={c.instructions}>
              {c.title}
            </h3>
            {c.cells[selectedIndex].hydrationSources.length > 0 && (
              <div className="sources">
                Using {c.cells[selectedIndex].hydrationSources.join(", ")}
              </div>
            )}
            <div className="cell-value">
              <Markdown
                remarkPlugins={[remarkGfm]}
                className="markdownContainer"
              >
                {c.cells[selectedIndex].displayValue || ""}
              </Markdown>
            </div>
          </div>
        ))}

        {showDetails ? (
          <div className="details details--open">
            {Object.keys(primaryCell.context).map((k) => {
              const value = primaryCell.context[k];
              return (
                <div className="selected-context-section" key={k}>
                  <h3 className="section-title">{k}</h3>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    className="markdownContainer"
                  >
                    {value ? value.toString() : ""}
                  </Markdown>
                </div>
              );
            })}
            <div className="more-details">
              <button className="button" onClick={() => setShowDetails(false)}>
                Hide details
              </button>
            </div>
          </div>
        ) : (
          <div className="more-details">
            <button className="button" onClick={() => setShowDetails(true)}>
              Show {primaryCell.context.type} details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
