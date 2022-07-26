import React, { Component } from "react";
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { withRouter } from "./withRouter";


const api_url = "https://5eo5juhaf6.execute-api.eu-west-1.amazonaws.com/v1/";
const list_resources_url = api_url + "list_resources?type=Horse";

class SelectResource extends Component {
    constructor(props) {
        super(props)

        this.state = {
            availableResources: [],
            selectedResource: {id: '', name: '', type: ''}
          }
    }

    componentDidMount() {
        fetch(list_resources_url).then(
          response => response.json()
        ).then(
          data => {
            this.setState({availableResources: data});
          }
        );
      }

    handleResourceSelection = (event) => {
      var fullSelectedResource = this.state.availableResources.find(
        x => x.id === event.target.value
      )
      this.setState({ selectedResource: fullSelectedResource }); 
    }
    
    handleSubmit = (e) => {
      e.preventDefault()
      console.log(this.state.selectedResource)
      this.props.navigate('/app/' + this.state.selectedResource.type + '/' + this.state.selectedResource.id)
    }

    render() {
      const renderOption = item => <MenuItem key={item["id"]} value={item["id"]}>{item["name"]}</MenuItem>
      const availableResources = Object.values(this.state.availableResources).map(renderOption)
      // console.log(Object.values(this.state.availableResources))
      // console.log('this.state.availableResources: ' + JSON.stringify(this.state.availableResources))
      return (
        <div>
          <Stack spacing={2}>
            <div className='wrapper'>
              <FormControl fullWidth>
                <InputLabel id="resourceSelector">Preferred Resource</InputLabel>
                <Select
                  labelId="resourceSelector"
                  label="Preferred Resource"
                  onChange={this.handleResourceSelection}
                  value={this.state.selectedResource.id}
                >
                  {availableResources}
                </Select>
              </FormControl>
            </div>
          </Stack>
          <form onSubmit={this.handleSubmit}>
            <Button variant="contained" type="submit">
              Book for resource
            </Button>
          </form>
        </div>
      )
    }
}

export default withRouter(SelectResource);
