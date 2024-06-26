import { useState } from 'react';
import './NewColumnForm.css';

type Props = {
  addNewColumn: ({title,instructions}:{title:string,instructions:string}) => void;
  errorMessage?: string;
}

export default function NewColumnForm({addNewColumn, errorMessage}:Props) {
  const [title, setTitle] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [message, setMessage] = useState<string>(errorMessage ? errorMessage : '');
  function addNewHandler(e:any) {
    e.preventDefault();
    setMessage('');

    if (title === '') {
      setMessage('enter a value');
      return;
    }

    addNewColumn({ title, instructions })
    setTitle('');
    setInstructions('')
    return false;
  }

  return (
    <div className="grid-col">
      <div className="grid-cell grid-cell--add-new-column">
        {message && <div className="error-message">{message}</div>}
        <form className="form" onSubmit={addNewHandler}>
          <h3>New column</h3>
          <div className="form-group">
            <label>Column title</label>
            <input
              className="input"
              type='text'
              placeholder='Column title...'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <input
              className="input"
              type='text'
              placeholder='Selec type...'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              className="input textarea"
              placeholder='Describe how this field should be populated...'
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>
          <button className='button' onClick={addNewHandler}>
            Add column
          </button>
        </form>
      </div>
    </div>
  )
}
