import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ComposerPage from './ComposerPage.jsx';

require('./styles/index.scss');

ReactDOM.render((
  <BrowserRouter>
    <Switch>
      <Route path="/" component={ComposerPage} />
    </Switch>
  </BrowserRouter>
), document.getElementById('app'));
