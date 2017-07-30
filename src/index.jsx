import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ComposerPage from './ComposerPage';
import KitchenSinkPage from './KitchenSinkPage';

require('./styles/index.scss');

ReactDOM.render((
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={ComposerPage} />
      <Route path="/sink" component={KitchenSinkPage} />
    </Switch>
  </BrowserRouter>
), document.getElementById('app'));
