import React from 'react';
import Invoice from './components/Invoice';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-start sm:items-center justify-center p-0 sm:p-4 print:p-0 print:bg-white w-full overflow-x-hidden">
      <Invoice />
    </div>
  );
}

export default App;
