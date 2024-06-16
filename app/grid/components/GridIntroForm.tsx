import './Button.css';
import './Grid.css';
import './Intro.css';

type Props = {
  state: 'empty' | 'loading' | 'done';
  setInputValue: (s:string) => void;
  inputValue: string;
  createPrimaryColumnHandler: (s:string) => void;
  errorMessage?: string;
}

export default function CreateIntroForm({ state , setInputValue, inputValue, createPrimaryColumnHandler, errorMessage}:Props) {
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

        <form onSubmit={() => createPrimaryColumnHandler(inputValue)} className="intro-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <input
            className="input"
            type='text'
            placeholder='Describe the data you want to see in the grid...'
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <button className='button' onClick={() => createPrimaryColumnHandler(inputValue)}>
            Submit
          </button>
        </form>

        <div className="suggestions">
          <h3>Try it</h3>
          {suggestions.map(s => (
            <button className="suggestion" key={s} onClick={() => {
              createPrimaryColumnHandler(s);
            }}>✨ {s}</button>
          ))}
        </div>
      </div>
    </div>
  )
}