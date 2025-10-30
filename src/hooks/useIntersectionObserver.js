import { useState, useEffect, useRef } from 'react';

export default function useIntersectionObserver(options) {
  const [elements, setElements] = useState([]);
  const [entries, setEntries] = useState([]);

  const observer = useRef(null);

  useEffect(() => {
    if (elements.length > 0) {
      observer.current = new IntersectionObserver((ioEntries) => {
        setEntries(ioEntries);
      }, options);

      elements.forEach(element => {
        observer.current.observe(element);
      });
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [elements, options]);

  return [observer, setElements, entries];
}