import React from "react";

export function useAutoToggle() {
  const [open, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen((e) => !e);
    }, 2000);
    return () => clearInterval(interval);
  }, [open]);

  return open;
}
