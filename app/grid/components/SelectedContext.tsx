import { PropsT } from '@/tmp-1701302270588-github-docs/src/frame/components/article/HeadingLink';
import { GridState } from '../actions';
import './SelectedContext.css';

type Props = {
  index: number;
  grid: GridState
}

export default function SelectedContext({ index, grid }:Props) {
  return (
    <div className="selected-context">

      <div className="selected-context-header">
        <div className="selected-context-title">
          {grid.primaryColumn[index].displayValue}
        </div>
        <div className="selected-context-close">Close</div>
      </div>

      <div className="selected-context-body">
        {grid.columns.map((c,i) => (
          <div className="selected-context-section" key={`context-${i}`}>
            <h3 className="selected-context-section">{c.key}</h3>
            {c.cells[index].displayValue}
          </div>
        ))}
      </div>
    </div>
  )
}

