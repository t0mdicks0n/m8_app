import chat_image from './chat_image.jpeg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={chat_image} className="App-logo" alt="chat_image" />
        <p>
          Chat with your m8's!
        </p>
      </header>
    </div>
  );
}

export default App;
