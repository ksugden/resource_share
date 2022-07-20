import React, { Component } from "react";

const api_url = "https://5eo5juhaf6.execute-api.eu-west-1.amazonaws.com/v1/";
const list_resources_url = api_url + "list_resources?type=Horse";

class SelectResource extends Component {
    constructor(props) {
        super(props)

        this.state = {
            availableResources: {}
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
  

    render() {
        return (<div>Blah</div>)
    }
}

export default SelectResource;
