import { useState } from 'react';

import './Button.css';
import './Grid.css';
import './Intro.css';
import { useGridContext } from './GridContext';

export default function CreateIntroForm() {
  const [state, setState] = useState<'empty' | 'loading' | 'done'>('empty');
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { inititializeGrid, } = useGridContext();

  async function createGrid(inputValue: string) {
    if (!inputValue) {
      alert('Please enter a value');
      return;
    }

    setState('loading');
    try {
      const response = await inititializeGrid(inputValue);
    } catch (e:any) {
      setErrorMessage(e.message);

    }
    setState('done');
  }

  if (state === 'loading') {
    return "Starting grid...";
  }

  const suggestions = [
    'merged pull requests on primer/design',
    'files related to the Action List component in primer/react',
    'recently closed pull requests in the vercel/swr repository',
    'the files changed in the most recently closed pull request in primer/react',
  ]; 

  return (  
    <div className="intro-layout">
      <div className="intro">
        <h1 className="title">Data Grid Agent</h1>
        <p className="description">
          Use natural language to easily populate the contents of a data grid with the Data Grid Agent. To get started, just describe the data you want to explore below. Once your grid is started, just add the columns that you want to populate and the data grid agent handles the rest. Have fun!
          {' '}<a href="https://github.com/skylar-anderson/openai-chat-playground/tree/main/app/grid">Source</a>
        </p>

        <form onSubmit={() => createGrid(inputValue)} className="intro-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <input
            className="input"
            type='text'
            placeholder='Describe the data you want to see in the grid...'
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button className='button' onClick={() => createGrid(inputValue)}>
            Submit
          </button>
        </form>

        <div className="suggestions">
          <h3>Try it</h3>
          {suggestions.map(s => (
            <button className="suggestion" key={s} onClick={() => {
              createGrid(s);
            }}>✨ {s}</button>
          ))}
        </div>
      </div>
    </div>
  )
}