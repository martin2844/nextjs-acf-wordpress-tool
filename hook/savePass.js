import { useState, useEffect } from "react";

export const useSavePassToLocalStorage = () => {
  //Low security pass to store pass as plain text in local storage.
  //Initialize lazy useState loading key = "pass" from "localstorage"
  const [pass, setPass] = useState(() => {
    if (typeof window !== "undefined") {
      return window?.localStorage?.getItem("pass") || "";
    }
    return "pass";
  });
  //When pass changes, setItem pass to local storage key "pass"
  useEffect(() => {
    window?.localStorage?.setItem("pass", pass);
  }, [pass]);

  return [pass, setPass];
};
