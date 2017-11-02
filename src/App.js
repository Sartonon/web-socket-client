import React, { Component } from 'react';
import './App.css';
import tausta from './tausta.png';

class App extends Component {
  state = {
    messages: [],
    username: "",
    usernameConfirmed: false,
    message: ""
  };

  componentDidMount() {
    this.websocket = new WebSocket("ws://http://139.162.254.62/ws");
    this.websocket.onmessage = this.handleMessage;
    this.websocket.onerror = this.handleError
  }

  handleError = () => {

  };

  sendMessage = () => {
    this.websocket.send(JSON.stringify({
      name: this.state.username,
      message: this.state.message
    }));
    this.setState({ message: "" });
  };

  handleMessage = (e) => {
    this.setState({ messages: [ ...this.state.messages, JSON.parse(e.data) ] });
    setTimeout(() => {
      var objDiv = document.getElementById("chatwindow");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 200);
  };

  changeUsername = (e) => {
    this.setState({ username: e.target.value })
  };

  confirmUsername = () => {
    this.setState({ usernameConfirmed: true })
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  renderMessages = () => {
    return this.state.messages.map((message, i) => {
      return (
        <div className="Message-wrapper">
          <div className="Message-block" key={i} style={{ float: i % 2 === 0 ? "left" : "right" }}>
            <div className="Message-name">{message.name}</div>
            <div className="Message-content">{message.message}</div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { usernameConfirmed, messages } = this.state;
    console.log(messages);

    return (
      <div className="App" style={{ backgroundImage: `url(${tausta})` }}>
        <header className="App-header">
          <h1 className="App-title">Chat</h1>
        </header>
        {!usernameConfirmed ?
          <div className="Login-div">
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>Anna käyttäjänimi</p>
            <input className="Login-input" value={this.state.username} onChange={this.changeUsername} />
            <div className="Ok-button" onClick={this.confirmUsername}>Ok</div>
          </div> :
          <div className="Chat-window" style={{ backgroundImage: `url(${tausta})` }}>
            <div id="chatwindow" className="Message-div">
              {this.renderMessages()}
            </div>
            <div className="Chat-input">
              <input className="Chat-inputfield" onChange={this.handleMessageChange} value={this.state.message} />
              <div className="Send-button" onClick={this.sendMessage}>Lähetä</div>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;
