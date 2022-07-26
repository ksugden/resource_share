import resourceShareLogo from './resourceShareLogo.png';
import dummyPic from './chestnut.png';
import icelandic from './icelandic.png';
import dummyPic2 from './white.png';
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
import TimeslotSelector from './components/TimeslotSelector';
import ResourceList from './components/ResourceList';
import { api_url } from './Config';

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

const miliseconds_per_hour = 60 * 60 * 1000;

//URLS
const list_bookings_url = api_url + "list_bookings?id=" + resource_id + "&hours=";
const make_booking_url = api_url + "add_booking";
const list_resources_url = api_url + "list_resources?type=Horse";

function getResourceImage(resourceId) {
  if (resourceId == 1) return dummyPic2;
  else if (resourceId == 2) return icelandic;
  else if (resourceId == 0) return dummyPic;
  else return null;
}


export default function App() {
  const [availableSlots, setAvailableSlots] = useState({});
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [finish, setFinish] = useState("");
  const [message, setMessage] = useState("");
  const [resources, setResources] = useState([]);

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


  useEffect(() => {
    fetch(list_resources_url)
      .then(res => res.json())
      .then(
        data => {
          setResources(data);
        })
      .catch((error) => console.error('Error loading resources', error));
  }, []);


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
            <div className="w3-sidebar" style={{ width: 250, marginLeft: 20 }}>
              <h2>Horses</h2>
              <ResourceList
                sendResourceIdToParent={sendResourceIdToParent}
                resources={resources}
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


