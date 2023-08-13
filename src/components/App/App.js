import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import routerPath from '@/libraries/routerPath';
import * as Loadable from '@/components/App/Loadable';

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_PATH}>
      <Route exact path={routerPath.ROOT}>
        <div className='app'>
          <Loadable.Orderbook />
        </div>
      </Route>
    </BrowserRouter>
  );
};

export default App;
