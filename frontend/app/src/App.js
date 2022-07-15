import resourceShareLogo from './resourceShareLogo.png';
import './App.css';
import React, { useState, useEffect}  from 'react';
import Stack from '@mui/material/Stack';


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

const allowed_durations = [1, 2, 3, 4];
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
  const [finish, setFinish] = useState("");
  const [message, setMessage] = useState("");

  
  const sendDurationToParent = (hours) => {    
    setDuration(hours);
  }
  
  const sendTimeToParent = (time) => {    
    setStartTime(time);
  }

  
  const sendDateToParent = (date) => {
    console.log('date:'+date);
    setStartDate(date);
  }


  function calcFinish(start, hours) {
    return new Date(start.getTime() + hours*miliseconds_per_hour);
  }


  function dateTime(date, time) {
    return new Date(date + ' ' + time);
  }


  //SUBMIT
  let handleSubmit = async (e) => {
    e.preventDefault();
    console.log('start date from TimeSelector:'+startDate);
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
        setMessage("Booked "+resourceDummyName+" for "+duration+' hours ('+startDatetime.toString()+'-'+finishDatetime.toString()+')');
        setStartDate("");
        setStartTime("");
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
          <h2>Book {resourceDummyName}</h2>
          <form onSubmit={handleSubmit}>
            <TimeslotSelector sendDateToParent={sendDateToParent} sendTimeToParent={sendTimeToParent} sendDurationToParent={sendDurationToParent}/>
              {/* // {timeslotsDummy}  */}
            <button type = "submit">
              <p>
                Book now
              </p>
            </button>
            <div className="message">{message ? <p>{message}</p> : null}</div>
          </form>
        </article>
      </div>
    </div>
  );
}



class TimeslotSelector extends React.Component {
  constructor(props) {
    super(props)

    this.sendDateToParent = props.sendDateToParent;
    this.sendTimeToParent = props.sendTimeToParent;
    this.sendDurationToParent = props.sendDurationToParent;
    this.handleFirstLevelChange = this.handleFirstLevelChange.bind(this);
    this.handleSecondLevelChange = this.handleSecondLevelChange.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);

    this.state = {
      duration: '',
      availableSlots: {},
      firstLevel: '',
      secondLevel: ''
    }
  }

  

  handleDurationChange(event) {
    console.log('event value: ' + event.target.value.toString())
    fetch(list_bookings_url+event.target.value).then(
      response => response.json()
    ).then(
      data => {
        this.setState({availableSlots: data});
      }
    );
    this.setState({ duration: event.target.value.toString() });
    this.sendDurationToParent(event.target.value.toString());
  }
  
  handleFirstLevelChange(event) {
    this.setState({ firstLevel: event.target.value });
    this.sendDateToParent(event.target.value);
  }

  handleSecondLevelChange(event) {
    this.setState({ secondLevel: event.target.value });
    this.sendTimeToParent(event.target.value);
  }

  render() {
    const renderOption = item => <option key={item} value={item}>{item}</option>
    const firstLevelOptions = Object.keys(this.state.availableSlots).map(renderOption)
    const secondLevelOptions = this.state.firstLevel.length ? this.state.availableSlots[this.state.firstLevel].map(renderOption): []


    return (
      <Stack className="Selector-container">

        <div className="App-selector">
          <select id='durationSelector' className="slot-selector" onChange={this.handleDurationChange} >
            {allowed_durations.map(renderOption)}
          </select>
        </div>
        
        <div className="App-selector">
          <select className="slot-selector" onChange={this.handleFirstLevelChange} >
            {firstLevelOptions}
          </select>
        </div>

        <div className="App-selector">
          <select className="slot-selector" onChange={this.handleSecondLevelChange} >
            {secondLevelOptions}
          </select>
        </div>
      </Stack>
    )
  }
}