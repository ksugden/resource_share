import dummyPic from '../chestnut.png';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';


class ResourceList extends React.Component {

    constructor(props) {
      super(props)
  
      this.handleResourceChange = this.handleResourceChange.bind(this);
      this.sendResourceIdToParent = props.sendResourceIdToParent;
      this.resources = props.resources;
  
      this.state = {
        selectedResource: (1)
      }
    }
  
  
    handleResourceChange(event, resourceId) {
      this.setState({ selectedResource: resourceId });
      this.sendResourceIdToParent((resourceId).toString());
    }
  
  
  
    render() {
      const miuRenderItem = item => <ListItem disablePadding key={item.id} >
        <ListItemButton
          selected={this.state.selectedResource === item.id}
          onClick={(event) => this.handleResourceChange(event, item.id)}
        >
          <ListItemAvatar>
            <Avatar alt={item.name} src={dummyPic} id={item.id}></Avatar>
          </ListItemAvatar>
          <ListItemText primary={item.name} />
        </ListItemButton>
      </ListItem>
  
      return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <nav aria-label="main mailbox folders">
            <List>
              {this.props.resources.map(miuRenderItem)}
            </List>
          </nav>
        </Box>
      )
    }
  }
  
  export default ResourceList
  
  