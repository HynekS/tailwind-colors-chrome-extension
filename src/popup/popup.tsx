import { h, createContext } from "preact";
import { useContext, useState } from "preact/hooks";

import { match } from "ts-pattern";
import convert from "color-convert";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Logo from "../components/logo";
import VersionSelect from "../components/version-select";
import allColors from "../colors/colors";

import "./popup.css";

import { getEntries } from "../utils/utils";
import type { DeepKeys, DeepValues } from "../utils/utils";

export const versions = ["v1", "v2", "v3"] as const;
export type Version = (typeof versions)[number];

const colorSpaces = {
  hex: "hex",
  "hex (alpha)": "hex (alpha)",
  "hex (no '#')": "hex (no '#')",
  rgb: "rgb",
  "rgb (legacy)": "rgb (legacy)",
  rgba: "rgba",
  "rgba (legacy)": "rgba (legacy)",
  lab: "lab",
  hsl: "hsl",
  hsla: "hsla",
  hwb: "hwb",
  cmyk: "cmyk",
} as const;

type ColorSpaces = (typeof colorSpaces)[keyof typeof colorSpaces];

const ColorSpaceContext = createContext<ColorSpaces[number]>("hex");

type ColorScaleProps = {
  color: (typeof allColors)[Version][keyof (typeof allColors)[Version]];
};

function ColorScale({ color }: ColorScaleProps) {
  return (
    <div class="grid mt-3 grid-cols-1 sm:grid-cols-11 gap-y-3 gap-x-2 sm:mt-2 2xl:mt-0">
      {
        // @ts-expect-error (don't know why this is inferred to "never"…)
        getEntries(color).map(([shade, value]) => (
          <Color value={value} shade={shade} />
        ))
      }
    </div>
  );
}

type ColorProps = {
  shade: DeepKeys<(typeof allColors)[Version], 1>;
  value: DeepValues<(typeof allColors)[Version], 1>;
};

function Color({ shade, value }: ColorProps) {
  const colorSpace = useContext(ColorSpaceContext);

  const valueInColorSpace = match<ColorSpaces[number]>(colorSpace)
    .with("hex", () => value)
    .with("hex (alpha)", () => value + "ff")
    .with("hex (no '#')", () => value.replace("#", ""))
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

          toast(`Color "${valueInColorSpace}" was copied to clipboard!`, {
            position: "bottom-right",
            progressStyle: { background: value },
          });
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
  const [version, setVersion] = useState<Version>(() => {
    const item = localStorage.getItem("version") as (typeof versions)[number];
    if (item) return item;
    return "v3";
  });

  const [colorSpace, setColorSpace] = useState<ColorSpaces[number]>(() => {
    const item = localStorage.getItem("colorSpace");
    if (item) return item;
    return "hex";
  });

  return colorSpace ? (
    <div class="py-8 px-16">
      <ToastContainer />
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 mb-4">
          <Logo class="w-8 h-8" />
          <h1 class="text-2xl font-bold">Tailwind colors</h1>
        </div>
        <VersionSelect
          onChange={(value: Version) => {
            localStorage.setItem("version", value);
            setVersion(value);
          }}
          selected={version}
        />
      </div>

      <ColorSpaceSelect
        name="colorspace"
        options={colorSpaces}
        label="Pick color space"
        onInput={async (e) => {
          const value = (e.target as HTMLInputElement).value;
          localStorage.setItem("colorSpace", value);
          setColorSpace(value);
        }}
        checkedValue={colorSpace}
      />
      <div class="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-2 gap-y-8 sm:grid-cols-1">
        <ColorSpaceContext.Provider value={colorSpace}>
          {getEntries(allColors[version]).map(([name, value]) => (
            <div class="2xl:contents">
              <div class="text-sm font-semibold text-slate-900 dark:text-slate-200 2xl:col-end-1 2xl:pt-2.5 capitalize">
                {name}
              </div>
              <ColorScale color={value} />
            </div>
          ))}
        </ColorSpaceContext.Provider>
      </div>
    </div>
  ) : null;
}

type ColorSpaceSelectProps = {
  name: ColorSpaces[number];
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
