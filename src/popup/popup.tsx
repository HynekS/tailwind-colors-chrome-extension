import { h, createContext } from "preact";
import { useContext, useState } from "preact/hooks";

import { match, P } from "ts-pattern";
import convert from "color-convert";
import colors from "tailwindcss/colors";
import type { DefaultColors } from "tailwindcss/types/generated/colors";

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
];

const ColorSpaceContext = createContext("rgb");

const pickableColorsNames = (
  Object.keys(colors) as Array<keyof DefaultColors>
).filter((key) => !colorsToOmit.includes(key));

type ColorScaleProps2 = {
  color: DefaultColors[keyof DefaultColors];
};

function ColorScale({ color }: ColorScaleProps2) {
  return (
    <div class="grid mt-3 grid-cols-1 sm:grid-cols-11 gap-y-3 gap-x-2 sm:mt-2 2xl:mt-0">
      {(Object.keys(color) as Array<keyof DefaultColors>).map((shade) => (
        <Color value={color[shade]} shade={shade} />
      ))}
    </div>
  );
}

type ColorProps = {
  shade: string;
  value: string;
};

function Color({ shade, value }: ColorProps) {
  const colorSpace = useContext(ColorSpaceContext);

  const valueInColorSpace = match(colorSpace)
    .with("hex", () => value)
    .with("hex alpha", () => value + "ff")
    .with("rgb", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgb(${r} ${g} ${b})`;
    })
    .with("rgba", () => {
      const [r, g, b] = convert.hex.rgb(value);
      return `rgba(${r} ${g} ${b}, 1)`;
    })
    .with("lab", () => {
      const [l, a, b] = convert.hex.lab(value);
      return `lab(${l}% ${a} ${b})`;
    })
    .with("hsl", () => {
      const [h, s, l] = convert.hex.lab(value);
      return `hsl(${h}, ${s}% ${l}%)`;
    })
    .otherwise(() => "Sorry, something went wrong.");

  return (
    <div class="relative flex">
      <div
        class="flex items-center gap-x-3 w-full cursor-pointer sm:block sm:space-y-1.5"
        onClick={() => {
          navigator.clipboard.writeText(valueInColorSpace);
          console.log(valueInColorSpace);
        }}
      >
        <div
          class="h-10 w-10 rounded dark:ring-1 dark:ring-inset dark:ring-white/10 sm:w-full"
          style={{ backgroundColor: valueInColorSpace }}
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
  const [colorSpace, setColorSpace] = useState("hex");

  return (
    <ColorSpaceContext.Provider value={colorSpace}>
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-4">Tailwind colors</h1>
        <ColorSpaceSelect
          name="colorspace"
          options={{
            hex: "hex",
            "hex alpha": "hex alpha",
            rgb: "rgb",
            rgba: "rgba",
            lab: "lab",
            hsl: "hsl",
          }}
          label="Pick color space"
          onInput={(e) => setColorSpace((e.target as HTMLInputElement).value)}
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
  );
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
