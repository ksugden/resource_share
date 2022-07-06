import resourceShareLogo from './resourceShareLogo.png';
import './App.css';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
 
export default function App() {
  const [value, setValue] = React.useState(Date.now());
  const [finish_value, setFinishValue] = React.useState(value);
 
  const handleChange = (newValue, newFinishValue) => {
    setValue(newValue);
    setFinishValue(newFinishValue)
  };

  const handleSubmit = 1;
 
  return (
   <div className="App">
      <header className="App-header">
        <img src={resourceShareLogo} className="App-logo" alt="logo" />
        <div style={{margin: "5% 40%"}}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={3}>
              <DateTimePicker
                label="Start"
                value={value}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <DateTimePicker
                label="Finish"
                value={finish_value}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} />}
              />
              <form onSubmit={handleSubmit}>
                <button>
                  Request booking
                </button>
              </form>
            </Stack>
          </LocalizationProvider>
        </div>
     </header>
   </div>
  );
}
