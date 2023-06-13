import { h, createContext } from "preact";
import { useContext, useState } from "preact/hooks";

import { match } from "ts-pattern";
import convert from "color-convert";
import colors from "tailwindcss/colors";
import type { DefaultColors } from "tailwindcss/types/generated/colors";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./popup.css";

const colorsToOmit = [
  // does not make sense to include
  "inherit",
  "current",
  "transparent",
  "black",
  "white",
  // deprecated names
  "lightBlue",
  "warmGray",
  "trueGray",
  "coolGray",
  "blueGray",
] as const;

const ColorSpaceContext = createContext("hex");

type ColorsWithoutOmitted = Omit<DefaultColors, (typeof colorsToOmit)[number]>;

const pickableColorsNames = (
  Object.keys(colors) as Array<keyof ColorsWithoutOmitted>
).filter((key) => !colorsToOmit.includes(key));

type ColorScaleProps = {
  color: ColorsWithoutOmitted[keyof ColorsWithoutOmitted];
};

function ColorScale({ color }: ColorScaleProps) {
  return (
    <div class="grid mt-3 grid-cols-1 sm:grid-cols-11 gap-y-3 gap-x-2 sm:mt-2 2xl:mt-0">
      {(
        Object.keys(color) as Array<
          keyof ColorsWithoutOmitted[keyof ColorsWithoutOmitted]
        >
      ).map((shade) => (
        <Color value={color[shade]} shade={shade} />
      ))}
    </div>
  );
}

type ColorProps = {
  // What. The. Actual. F***.
  shade: keyof ColorsWithoutOmitted[keyof ColorsWithoutOmitted];
  value: ColorsWithoutOmitted[keyof ColorsWithoutOmitted][keyof ColorsWithoutOmitted[keyof ColorsWithoutOmitted]];
};

function Color({ shade, value }: ColorProps) {
  const colorSpace = useContext(ColorSpaceContext);

  const notify = (t = "") => toast(t, { position: "bottom-right" });

  const valueInColorSpace = match(colorSpace)
    .with("hex", () => value)
    .with("hex alpha", () => value + "ff")
    .with("rgb", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgb(${r} ${g} ${b})`;
    })
    .with("rgb (legacy)", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgb(${r}, ${g}, ${b})`;
    })
    .with("rgba", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgba(${r} ${g} ${b}/1)`;
    })
    .with("rgba (legacy)", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgba(${r}, ${g}, ${b}, 1)`;
    })
    .with("lab", () => {
      const [l, a, b] = convert.hex.lab(value);
      return `lab(${l}% ${a} ${b})`;
    })
    .with("hsl", () => {
      const [h, s, l] = convert.hex.hsl(value);
      return `hsl(${h}, ${s}% ${l}%)`;
    })
    .with("hsla", () => {
      const [h, s, l] = convert.hex.hsl(value);
      return `hsla(${h}, ${s}% ${l}%, 1)`;
    })
    .with("hwb", () => {
      const [h, w, b] = convert.hex.hwb(value);
      return `hwb(${h}deg ${w}% ${b}%)`;
    })
    .with("cmyk", () => {
      const [c, m, y, k] = convert.hex.cmyk(value);
      return `cmyk(${c}% ${m}% ${y}% ${k}%)`;
    })
    .otherwise(() => "Sorry, something went wrong.");

  return (
    <div class="relative flex">
      <div
        class="flex items-center gap-x-3 w-full cursor-pointer sm:block sm:space-y-1.5"
        onClick={() => {
          navigator.clipboard.writeText(valueInColorSpace);
          (document.querySelector(":root") as HTMLElement).style.setProperty(
            "--toastify-color-progress-light",
            value
          );
          notify(`Color "${valueInColorSpace}" was copied to clipboard!`);
        }}
      >
        <div
          class="h-10 w-10 rounded dark:ring-1 dark:ring-inset dark:ring-white/10 sm:w-full"
          // There is a bug not rendering bg color in some color spaces. Until resolved, fallback to default (hex)?
          // Also, the rendered DOM value is always rgb, no matter what the color space is (which is Chrome default behavior).
          style={{ backgroundColor: value }}
        ></div>
        <div class="px-0.5">
          <div class="w-6 font-medium text-xs text-slate-900 2xl:w-full dark:text-white">
            {shade}
          </div>
          <div class="text-slate-500 text-xs font-mono lowercase dark:text-slate-400 sm:text-[0.625rem] md:text-xs lg:text-[0.625rem] 2xl:text-xs">
            {valueInColorSpace}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Popup() {
  const [colorSpace, setColorSpace] = useState(() => {
    const item = localStorage.getItem("colorSpace");
    if (item) return item;
    return "hex";
  });

  return colorSpace ? (
    <ColorSpaceContext.Provider value={colorSpace}>
      <div class="p-8">
        <ToastContainer />
        <h1 class="text-2xl font-bold mb-4">Tailwind colors</h1>
        <ColorSpaceSelect
          name="colorspace"
          options={{
            hex: "hex",
            "hex alpha": "hex alpha",
            rgb: "rgb",
            "rgb (legacy)": "rgb (legacy)",
            rgba: "rgba",
            "rgba (legacy)": "rgba (legacy)",
            lab: "lab",
            hsl: "hsl",
            hsla: "hsla",
            hwb: "hwb",
            cmyk: "cmyk",
          }}
          label="Pick color space"
          onInput={async (e) => {
            const value = (e.target as HTMLInputElement).value;
            localStorage.setItem("colorSpace", value);
            setColorSpace(value);
          }}
          checkedValue={colorSpace}
        />
        <div class="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-2 gap-y-8 sm:grid-cols-1">
          {pickableColorsNames.map((color) => (
            <div class="2xl:contents">
              <div class="text-sm font-semibold text-slate-900 dark:text-slate-200 2xl:col-end-1 2xl:pt-2.5 capitalize">
                {color}
              </div>
              <ColorScale color={colors[color]} />
            </div>
          ))}
        </div>
      </div>
    </ColorSpaceContext.Provider>
  ) : null;
}

type ColorSpaceSelectProps = {
  name: string;
  options: Record<string, any>;
  label: string;
  onInput: (e: Event) => void;
  checkedValue: string;
  props?: any;
};

function ColorSpaceSelect({
  name,
  options,
  label,
  onInput,
  checkedValue,
  ...props
}: ColorSpaceSelectProps) {
  const renderRadioButtons = (key: string | number, index: number) => {
    return (
      <div key={key} class="relative inline-flex mb-4">
        <input
          type="radio"
          id={`${name}-${index}`}
          name={name}
          value={String(options[key])}
          class="hidden peer"
          onInput={onInput}
          checked={String(options[key]) === checkedValue}
        />
        <label
          htmlFor={`${name}-${index}`}
          class="block px-4 py-2 border rounded mr-2 peer-checked:text-blue-600 peer-checked:border-blue-600 cursor-pointer"
        >
          {key}
        </label>
      </div>
    );
  };

  if (name && options) {
    return (
      <div>
        <div>
          <label htmlFor={name} class="block mb-2 font-semibold">
            {label}
          </label>
        </div>
        <div {...props}>
          {options && Object.keys(options).map(renderRadioButtons)}
        </div>
      </div>
    );
  }
  console.warn('"name" and "options" props are required');

  return null;
}
