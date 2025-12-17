import React from 'react';

export const ViewModeContext = React.createContext({
  viewMode: 'grid',
  setViewMode: () => {}
});
