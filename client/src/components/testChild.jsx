import { useState, useEffect } from "react";

export function Child() {
  // The state is manteined during reparenting.
  const [state] = useState(() => Math.random().toFixed(10));

  // Logs the component lificycle.
  console.log("-- rendering the child");
  useEffect(() => {
    // The component is mounted only one time.
    console.log("---- mounting the child");
    return () => {
      // The component is never unmounted during reparenting.
      console.log("------ unmounting the child");
    };
  }, []);

  return <div className="child">State: {state}</div>;
}
