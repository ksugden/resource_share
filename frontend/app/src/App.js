import resourceShareLogo from './resourceShareLogo.png';
import chestnut from './chestnut.png';
import icelandic from './icelandic.png';
import './App.css';
import React, { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';


const theme = createTheme({
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#f50057',
      darker: '#ab003c'
      ,
    },
    neutral: {
      main: '#f73378',
      contrastText: '#fff',
    },
  },
});


// Test data
const userDummyName = 'User A'; // comes from previous page
const resource_id = 1; // comes from previous page
const hours = 1; // could come from earlier drop-down
const resourceDummyName = 'Dobbin' // comes from lookup on Resources table
const timeslotsDummy = {
  'Wednesday 20-07': ['10:00', '11:00', '16:00'],
  'Thursday 21-07': ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'],
  'Friday 22-07': ['09:00', '12:00', '16:00', '15:00', '16:00', '17:00'],
  'Saturday 23-07': ['12:00', '13:00', '14:00']
};
const resourcesDummy = [
  { 'name': 'Dobbin', 'id': 1, 'type': 'Horse' },
  { 'name': 'Pixie', 'id': 2, 'type': 'Horse' }
];

const allowed_durations = ['1 hour', '2 hours', '3 hours', '4 hours'];
const miliseconds_per_hour = 60 * 60 * 1000;

//URLS
const api_url = "https://5eo5juhaf6.execute-api.eu-west-1.amazonaws.com/v1/";
const list_bookings_url = api_url + "list_bookings?id=" + resource_id + "&hours=";
const make_booking_url = api_url + "add_booking";


export default function App() {
  const [availableSlots, setAvailableSlots] = useState({});
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [finish, setFinish] = useState("");
  const [message, setMessage] = useState("");

  const sendResourceIdToParent = (resourceId) => {
    setResourceId(resourceId);
  }

  const sendDurationToParent = (hours) => {
    setDuration(hours);
  }

  const sendTimeToParent = (time) => {
    setStartTime(time);
  }


  const sendDateToParent = (date) => {
    console.log('date:' + date);
    setStartDate(date);
  }


  function calcFinish(start, hours) {
    return new Date(start.getTime() + hours * miliseconds_per_hour);
  }


  function dateTime(date, time) {
    return new Date(date + ' ' + time + ' UTC');
  }

  function getResourceImage(resourceId) {
    if (resourceId == 1) return chestnut;
    else if (resourceId == 2) return icelandic;
    else return null;
  }


  //SUBMIT
  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log('start date from TimeSelector:' + startDate);
    const startDatetime = dateTime(startDate, startTime);
    const finishDatetime = calcFinish(startDatetime, duration);
    const post_str = JSON.stringify({
      username: userDummyName,
      resource_id: resource_id.toString(),
      start: startDatetime.toISOString(),
      finish: finishDatetime.toISOString()
    });
    try {
      console.log('Trying to post:', post_str)
      let res = await fetch(make_booking_url, {
        method: "POST",
        body: post_str,
      });
      let resJson = await res.json();
      if (res.status === 200) {
        console.log("Booked " + resourceDummyName + " for " + duration + ' hours (' + startDatetime.toString() + '-' + finishDatetime.toString() + ')');
        setStartDate("");
        setStartTime("");
        // here I should call something to call API again, reload data and populate drop-downs
      } else {
        setMessage("An error occured");
      }
    } catch (err) {
      console.log(err);
    }
  };



  return (
    <div className="App">
      <header className="App-header">
        <img src={resourceShareLogo} className="App-logo" alt="logo" />
        <h1>Share Hub</h1>
      </header>

     

      <div>
        <article className="Book-element">
          <ThemeProvider theme={theme}>
          <div class="w3-sidebar" style={{width:250, marginLeft:20}}>
      <h2>Horses</h2>
      <ResourceList 
                  sendResourceIdToParent={sendResourceIdToParent}
                />
</div>
            
            <div className='wrapper'>
              <Stack spacing={4}>
              <div className='thumb'>
                <img src={getResourceImage(resourceId)} id="id"></img>
                </div>
                <TimeslotSelector
                  resourceId={resourceId}
                  sendDateToParent={sendDateToParent}
                  sendTimeToParent={sendTimeToParent}
                  sendDurationToParent={sendDurationToParent}
                />
                <form onSubmit={handleSubmit}>
                  <Button variant="contained" type="submit">
                    Reserve me!
                  </Button>
                </form>
                <div className="message">{message ? <p>{message}</p> : null}</div>
              </Stack>
            </div>
          </ThemeProvider>
        </article>
      </div>
    </div>
  );
}


class ResourceList extends React.Component {
  
  constructor(props) {
    super(props)

    this.handleResourceChange = this.handleResourceChange.bind(this);
    this.sendResourceIdToParent = props.sendResourceIdToParent;

    this.state = {
      resources: [],
      selectedIndex: (1)
    }
  }

 
  handleResourceChange(event, index) {
    console.log('on click event :' + index);
    this.setState({ selectedIndex: index });
    // this.setResourceId({  });
    this.sendResourceIdToParent((index+1).toString());
    // this.sendResourceImgToParent();
  }


  render() {
    return (
      <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        <nav aria-label="main mailbox folders">
          <List>
            <ListItem disablePadding>
              <ListItemButton
                selected={this.state.selectedIndex === 0}
                onClick={(event) => this.handleResourceChange(event, 0)}
              >
                <ListItemAvatar>
                  <Avatar alt='Dobbin' src={chestnut} id="id"></Avatar>
                </ListItemAvatar>
                <ListItemText primary="Dobbin" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                selected={this.state.selectedIndex === 1}
                onClick={(event) => this.handleResourceChange(event, 1)}
              >
                <ListItemAvatar>
                  <Avatar src={icelandic} id="id"></Avatar>
                </ListItemAvatar>
                <ListItemText primary="Pixie" />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
      </Box>
    )


  }
}



class TimeslotSelector extends React.Component {
  constructor(props) {
    super(props)
    
    this.sendDateToParent = props.sendDateToParent;
    this.sendTimeToParent = props.sendTimeToParent;
    this.resourceId = props.resourceId;
    this.sendDurationToParent = props.sendDurationToParent;
    
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);
    
    this.state = {
      duration: '',
      availableSlots: {'No dates calculated':['no time', 'no time']},
      firstLevel: '',
      secondLevel: ''
    }
  }
  
  
  
  handleDurationChange(event) {
    var duration = event.target.value.substring(0, 1);
    var list_bookings_url = api_url + "list_bookings?id=" + this.props.resourceId + "&hours=";
    console.log('event value: ' + duration)
    this.props.resourceId != '' ? 
    console.log('fetching: ' + list_bookings_url + duration): console.log('Not fetching!');
    
    this.props.resourceId != '' ? 
    fetch(list_bookings_url + duration).then(
      response => response.json()
      ).then(
        data => {
          this.setState({ availableSlots: data });
        }
        ) : console.log('No resource Id selected');
        this.setState({ duration: duration });
        this.sendDurationToParent(duration);
      }
      
      handleDateChange(event) {
        this.setState({ firstLevel: event.target.value });
        this.sendDateToParent(event.target.value);
      }
      
      handleTimeChange(event) {
        this.setState({ secondLevel: event.target.value });
        this.sendTimeToParent(event.target.value);
      }
      
      timezone(times) {
        var tz_times = new Array(times.length);
        for (let t = 0; t < times.length; t++) {
          tz_times[t] = new Date(times[t] + ' UTC');
          tz_times[t] = tz_times[t].time();
        }
      }
      
      render() {
        console.log('resourceId:'+this.props.resourceId);
        const renderOption = item => <MenuItem key={item} value={item}>{item}</MenuItem>
        const firstLevelOptions = Object.keys(this.state.availableSlots).map(renderOption)
        console.log('this.state.availableSlots[this.state.firstLevel]: ' + this.state.availableSlots[this.state.firstLevel])
        // console.log('this.state.availableSlots[this.state.firstLevel].length: '+this.state.availableSlots[this.state.firstLevel].length)
        // var tz_times = this.timezone(this.state.availableSlots[this.state.firstLevel]);
        // console.log('timzoned times: '+ tz_times);
        const secondLevelOptions = this.state.firstLevel.length ? this.state.availableSlots[this.state.firstLevel].map(renderOption) : []
        
        
        return (
      <Stack spacing={2}>

        <div className='wrapper'>
          <FormControl fullWidth>
            <InputLabel id="durationSelector">Duration</InputLabel>
            <Select
              labelId="durationSelector"
              label="Duration"
              onChange={this.handleDurationChange}
            >
              {allowed_durations.map(renderOption)}
            </Select>
          </FormControl>
        </div>


        <div className='wrapper'>
          <FormControl fullWidth>
            <InputLabel id="dateSelector">Date</InputLabel>
            <Select
              labelId="dateSelector"
              label="Date"
              onChange={this.handleDateChange}
            >
              {firstLevelOptions}
            </Select>
          </FormControl>
        </div>

        <div className='wrapper'>
          <FormControl fullWidth>
            <InputLabel id="timeSelector">Start time</InputLabel>
            <Select
              labelId="timeSelector"
              label="Start time"
              onChange={this.handleTimeChange}
            >
              {secondLevelOptions}
            </Select>
          </FormControl>
        </div>
      </Stack>
    )
  }
}