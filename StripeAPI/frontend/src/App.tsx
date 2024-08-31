import * as React from 'react';
import Checkout from './Checkout';

const App: React.FC = () => {
  console.log('app rendered')
  return (
    <div>
      <h1>Your Store</h1>
      <Checkout />
    </div>
  );
};

export default App;