import { useState } from 'react';
import { GridState } from '../actions';

type Props = {
  gridState:GridState;
  addNewColumn: (s:string) => void;
  errorMessage?: string;
}

export default function NewColumnForm({addNewColumn, gridState, errorMessage}:Props) {
  const [inputValue, setInputValue] = useState<string>('');
  const [message, setMessage] = useState<string>(errorMessage ? errorMessage : '');
  function addNewHandler(e:any) {
    e.preventDefault();
    setMessage('');

    if (inputValue === '') {
      setMessage('enter a value');
      return;
    }

    addNewColumn(inputValue)
    setInputValue('');
    return false;
  }

  return (
    <div className="grid-col">
    <div className="grid-cell grid-cell--header grid-cell--add-new-column">
      {message && <div className="error-message">{message}</div>}
      <form className="inline-form-group" onSubmit={addNewHandler}>
        <input
          className="input"
          type='text'
          placeholder='Add another column...'
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button className='button' onClick={addNewHandler}>
          Add
        </button>
      </form>
    </div>

    {gridState.primaryColumn.map((_, i) => (
      <div className='grid-cell' key={i}></div>
    ))}
    </div>
  )
}
