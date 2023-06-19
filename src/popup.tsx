import { h, render } from "preact";
import Popup from "./popup/popup";

if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  console.log("should be dark");
  document.documentElement.classList.add("dark");
} else {
  console.log("should not be dark");
  document.documentElement.classList.remove("dark");
}

render(<Popup />, document.body);
