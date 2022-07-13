import resourceShareLogo from './resourceShareLogo.png';
import './App.css';
import React, { useState, useEffect}  from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import { daysToWeeks } from 'date-fns';


const resource_id = 1; // comes from previous page
const hours = 1;
const list_bookings_url = "https://5eo5juhaf6.execute-api.eu-west-1.amazonaws.com/v1/list_bookings?id=" + resource_id + "&hours=" + hours;


export default function App() {
  const [value, setValue] = useState(Date.now());
  const [finish_value, setFinishValue] = useState(value);

  const handleChange = (newValue, newFinishValue) => {
    setValue(newValue);
    setFinishValue(newFinishValue)
  };

  const handleSubmit = 1;


  const timeslotsDummy = {
    'Wednesday 20-07': ['10:00', '11:00', '16:00'],
    'Thursday 21-07': ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'],
    'Friday 22-07': ['09:00', '12:00', '16:00', '15:00', '16:00', '17:00'],
    'Saturday 23-07': ['12:00', '13:00', '14:00']
  };


  const [availableSlots, setAvailableSlots] = useState([]);


  useEffect(() => {
    fetch(list_bookings_url).then(
      response => response.json()
    ).then(
      data => {
        console.log("data is : ", data);
        setAvailableSlots(data);
      }
    );
  })

  const resourceDummyName = 'Dobbin'

  return (
    <div className="App">
      <header className="App-header">
        <img src={resourceShareLogo} className="App-logo" alt="logo" />
        <h1>Share Hub</h1>
      </header>
      <body>
        <article className="Book-element">
          <h2>Book {resourceDummyName}</h2>
          <form onSubmit={handleSubmit}>
            <TimeslotSelector options={timeslotsDummy}
              // {availableSlots} 
              />
            <button>
              <p>
                Book now
              </p>
            </button>
          </form>
        </article>
      </body>
    </div>
  );
}



class TimeslotSelector extends React.Component {
  constructor(props) {
    super(props)

    this.handleFirstLevelChange = this.handleFirstLevelChange.bind(this)
    this.handleSecondLevelChange = this.handleSecondLevelChange.bind(this)

    // Prepopulate with the first item for each level
    this.state = {
      firstLevel: Object.keys(props.options)[0],
      secondLevel: Object.keys(props.options)[0][0]
    }
  }

  handleFirstLevelChange(event) {
    this.setState({ firstLevel: event.target.value });
  }

  handleSecondLevelChange(event) {
    this.setState({ secondLevel: event.target.value });
  }

  render() {
    const renderOption = item => <option value={item}>{item}</option>
    const firstLevelOptions = Object.keys(this.props.options).map(renderOption)
    const secondLevelOptions = this.props.options[this.state.firstLevel].map(renderOption)

    return (
      <Stack className="Selector-container">

        <div className="App-selector">
          <select class="slot-selector" onChange={this.handleFirstLevelChange} value={this.state.firstLevel}>
            {firstLevelOptions}
          </select>
        </div>

        <div className="App-selector">
          <select class="slot-selector" onChange={this.handleSecondLevelChange} value={this.state.secondLevel}>
            {secondLevelOptions}
          </select>
        </div>
      </Stack>
    )
  }
}
