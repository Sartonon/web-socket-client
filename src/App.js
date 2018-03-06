import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    messages: [],
    username: "",
    usernameConfirmed: false,
    message: ""
  };

  componentDidMount() {
    this.initWebSocket();
  }

  initWebSocket = () => {
    this.websocket = new WebSocket("ws://139.162.254.62/ws");
    this.websocket.onmessage = this.handleMessage;
    this.websocket.onerror = this.handleError;
    this.websocket.onclose = this.handleOnClose;
  };

  handleOnClose = () => {
    console.log("Connection closed, starting new one...");
    this.initWebSocket();
  };

  handleError = (error) => {
    console.log("error: ", error);
  };

  sendMessage = (e) => {
    e.preventDefault();
    this.websocket.send(JSON.stringify({
      name: this.state.username,
      message: this.state.message
    }));
    this.setState({ message: "" });
  };

  handleMessage = (e) => {
    this.setState({ messages: [ ...this.state.messages, JSON.parse(e.data) ] });
    setTimeout(() => {
      const objDiv = document.getElementById("chatwindow");
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
        <div className="Message-wrapper" key={i}>
          <div className="Message-block" key={i} style={{ float: i % 2 === 0 ? "left" : "right" }}>
            <div className="Message-name">{message.name}</div>
            <div className="Message-content">{message.message}</div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { usernameConfirmed } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chat</h1>
        </header>
        {!usernameConfirmed ?
          <div className="Login-div">
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>Anna käyttäjänimi</p>
            <input className="Login-input" value={this.state.username} onChange={this.changeUsername} />
            <div className="Ok-button" onClick={this.confirmUsername}>Ok</div>
          </div> :
          <div className="Chat-window">
            <div id="chatwindow" className="Message-div">
              {this.renderMessages()}
            </div>
            <form onSubmit={this.sendMessage}>
              <div className="Chat-input">
                <input className="Chat-inputfield" onChange={this.handleMessageChange} value={this.state.message} />
                <div className="Send-button" onClick={this.sendMessage}>Lähetä</div>
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default App;
