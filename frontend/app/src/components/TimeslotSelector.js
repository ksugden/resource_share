import React from 'react'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { allowed_durations, api_url } from '../Config';




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
      availableSlots: { 'No dates calculated': ['no time', 'no time'] },
      firstLevel: '',
      secondLevel: ''
    }
  }



  handleDurationChange(event) {
    var duration = event.target.value.substring(0, 1);
    var list_bookings_url = api_url + "list_bookings?id=" + this.props.resourceId + "&hours=";
    this.props.resourceId != '' ?
      console.log('fetching: ' + list_bookings_url + duration) : console.log('Not fetching!');

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
    const renderOption = item => <MenuItem key={item} value={item}>{item}</MenuItem>
    const firstLevelOptions = Object.keys(this.state.availableSlots).map(renderOption)
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

  export default TimeslotSelector