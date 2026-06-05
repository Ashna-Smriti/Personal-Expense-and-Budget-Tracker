import { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.5 }) {
  const ref = useRef(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!value && value !== 0) return;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(current);
      }
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  );
}
