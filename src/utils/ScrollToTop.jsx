// /src/utils/ScrollToTop.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ye component har baar URL change hone par page ko top par scroll kar deta hai.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Jab bhi pathname badlega, ye effect run hoga.

  return null; // Ye component screen par kuch bhi nahi dikhata.
};

export default ScrollToTop;
