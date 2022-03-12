import React, { Component } from 'react';
import {Button, Badge, TextField, Grid, Container, Card, CardHeader, Paper, Avatar, FormHelperText, Typography} from "@mui/material";
import ReconnectingWebSocket from 'reconnecting-websocket';

export default class Chat extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    messages: [],
    value:'',
    connected: false,
    peer_connected: false,
  };

  rws = new ReconnectingWebSocket('ws://' + window.location.host + '/ws/chat/' + this.props.orderId + '/');

  componentDidMount() {
    this.rws.addEventListener('open', () => {
      console.log('Connected!');
      this.setState({connected: true});
      this.rws.send(JSON.stringify({
        type: "message",
        message: 'just-connected',
        nick: this.props.ur_nick,
      }));
    });

    this.rws.addEventListener('message', (message) => {

      const dataFromServer = JSON.parse(message.data);
      console.log('Got reply!', dataFromServer.type);

      if (dataFromServer){
        if (dataFromServer.message != 'just-connected' & dataFromServer.message != 'peer-disconnected'){
          this.setState((state) =>
          ({
            messages: [...state.messages,
            {
              msg: dataFromServer.message,
              userNick: dataFromServer.user_nick,
            }],
          })
          )
        }
        this.setState({peer_connected: dataFromServer.peer_connected})
      }
    });

    this.rws.addEventListener('close', () => {
      console.log('Socket is closed. Reconnect will be attempted');
      this.setState({connected: false});
    });

    this.rws.addEventListener('error', () => {
      console.error('Socket encountered error: Closing socket');
    });
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  onButtonClicked = (e) => {
    if(this.state.value!=''){
      this.rws.send(JSON.stringify({
        type: "message",
        message: this.state.value,
        nick: this.props.ur_nick,
      }));
      this.state.value = ''
    }
    e.preventDefault();
  }

  render() {
    return (
      <Container component="main" maxWidth="xs" >
            <Grid container xs={12} spacing={0.5}>
              <Grid item xs={0.3}/>
              <Grid item xs={5.5}>
                <Paper elevation={1} style={this.state.connected ? {backgroundColor: '#e8ffe6'}: {backgroundColor: '#FFF1C5'}}>
                  <Typography variant='caption' >
                    You: {this.state.connected ? 'connected': 'disconnected'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={0.4}/>
              <Grid item xs={5.5}>
                <Paper elevation={1} style={this.state.peer_connected ? {backgroundColor: '#e8ffe6'}: {backgroundColor: '#FFF1C5'}}>
                  <Typography variant='caption'>
                    Peer: {this.state.peer_connected ? 'connected': 'disconnected'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={0.3}/>
            </Grid>
            <Paper elevation={1} style={{ height: 300, maxHeight: 300, width:280,overflow: 'auto', backgroundColor: '#F7F7F7' }}>
              {this.state.messages.map(message => <>
              <Card elevation={5} align="left" >
              {/* If message sender is not our nick, gray color, if it is our nick, green color */}
              {message.userNick == this.props.ur_nick ? 
                <CardHeader
                  avatar={
                    <Badge variant="dot" overlap="circular" badgeContent="" color={this.state.connected ? "success" : "error"}>
                      <Avatar className="flippedSmallAvatar"
                        alt={message.userNick}
                        src={window.location.origin +'/static/assets/avatars/' + message.userNick + '.png'} 
                        />
                    </Badge>
                  }
                  style={{backgroundColor: '#eeeeee'}}
                  title={message.userNick}
                  subheader={message.msg}
                  subheaderTypographyProps={{sx: {wordWrap: "break-word", width: 200}}}
                />
                :
                <CardHeader
                  avatar={
                    <Badge variant="dot" overlap="circular" badgeContent="" color={this.state.peer_connected ? "success" : "error"}>
                      <Avatar className="flippedSmallAvatar"
                        alt={message.userNick}
                        src={window.location.origin +'/static/assets/avatars/' + message.userNick + '.png'} 
                        />
                    </Badge>
                  }
                  style={{backgroundColor: '#fafafa'}}
                  title={message.userNick}
                  subheader={message.msg}
                  subheaderTypographyProps={{sx: {wordWrap: "break-word", width: 200}}}
                />} 
                </Card>
              </>)}
              <div style={{ float:"left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}></div>
            </Paper>
            <form noValidate onSubmit={this.onButtonClicked}>
              <Grid containter alignItems="stretch" style={{ display: "flex" }}>
                <Grid item alignItems="stretch" style={{ display: "flex"}}>
                  <TextField
                    label="Type a message"
                    variant="standard"
                    size="small"
                    helperText={this.state.connected ? null : "Connecting..."}
                    value={this.state.value}
                    onChange={e => {
                      this.setState({ value: e.target.value });
                      this.value = this.state.value;
                    }}
                    sx={{width: 214}}
                  />
                </Grid>
                <Grid item alignItems="stretch" style={{ display: "flex" }}>
                  <Button disabled={!this.state.connected} type="submit" variant="contained" color="primary" > Send </Button>
                </Grid>
              </Grid>
            </form>
            <FormHelperText>
              The chat has no memory: if you leave, messages are lost. <a target="_blank" href="https://github.com/Reckless-Satoshi/robosats/blob/main/docs/sensitive-data-PGP-guide.md/"> Learn easy PGP encryption.</a>
            </FormHelperText>
      </Container>
    )
  }
}