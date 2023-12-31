import { h, render } from "preact";
import App from "./popup/app";

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

render(<App />, document.body);
