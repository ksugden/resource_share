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
import { useParams } from "react-router-dom";

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
const hours = 1; // could come from earlier drop-down
const timeslotsDummy = {
  'Wednesday 20-07': ['10:00', '11:00', '16:00'],
  'Thursday 21-07': ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'],
  'Friday 22-07': ['09:00', '12:00', '16:00', '15:00', '16:00', '17:00'],
  'Saturday 23-07': ['12:00', '13:00', '14:00']
};

const allowed_durations = ['1 hour', '2 hours', '3 hours', '4 hours'];
const miliseconds_per_hour = 60 * 60 * 1000;

//URLS
const api_url = "https://5eo5juhaf6.execute-api.eu-west-1.amazonaws.com/v1/";
const make_booking_url = api_url + "add_booking";


export default function App() {
  const [availableSlots, setAvailableSlots] = useState({});
  const [resourceName, setResourceName] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [finish, setFinish] = useState("");
  const [message, setMessage] = useState("");
  let { type, resource_id } = useParams();
  const get_resource_url = api_url + "get_resource/" + type + "/" + resource_id 
  const list_available_slots_url = api_url + "list_available_slots?id=" + resource_id + "&hours=";


  useEffect(() => {
    fetch(get_resource_url).then(
      response => response.json()
    ).then(
      data => {
        console.log(data)
        setResourceName(data.name );
        setResourceType(data.type );
      }
    );
  }, [])

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
        setMessage("Booked " + resourceName + " for " + duration + ' hours (' + startDatetime.toString() + '-' + finishDatetime.toString() + ')');
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
      { resourceName == "" ? <div>loading - {type}, {resource_id} </div> : 
      <div>
        <article className="Book-element">
          <ThemeProvider theme={theme}>
            <div className='wrapper'>
              <Stack spacing={2}>
                <TimeslotSelector
                  sendDateToParent={sendDateToParent}
                  sendTimeToParent={sendTimeToParent}
                  sendDurationToParent={sendDurationToParent}
                  listBookingsUrl={list_available_slots_url}
                />
                <form onSubmit={handleSubmit}>
                  <Button variant="contained" type="submit">
                    Reserve {resourceName}
                  </Button>
                </form>
                <div className="message">{message ? <p>{message}</p> : null}</div>
              </Stack>
            </div>
          </ThemeProvider>
        </article>
      </div>
    }
    </div>
  );
}



class TimeslotSelector extends React.Component {
  constructor(props) {
    super(props)

    this.sendDateToParent = props.sendDateToParent;
    this.sendTimeToParent = props.sendTimeToParent;
    this.sendDurationToParent = props.sendDurationToParent;
    this.listBookingsUrl = props.listBookingsUrl
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);

    this.state = {
      duration: '',
      availableSlots: {},
      firstLevel: '',
      secondLevel: ''
    }
  }



  handleDurationChange(event) {
    var duration = event.target.value.substring(0, 1);
    console.log('event value: ' + duration)
    fetch(this.listBookingsUrl + duration).then(
      response => response.json()
    ).then(
      data => {
        this.setState({ availableSlots: data });
      }
    );
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
              value={this.state.duration ? this.state.duration + " hours" : ""}
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
              value={this.state.firstLevel}
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
              value={this.state.secondLevel}
            >
              {secondLevelOptions}
            </Select>
          </FormControl>
        </div>
      </Stack>
    )
  }
}