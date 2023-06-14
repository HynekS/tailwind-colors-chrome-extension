// Due to the structure of v1, it does not make much sense to trying to import drom module
import colors_v1 from "../colors/tailwindcss-v1.colors";
import colors_v2 from "tailwindcss-v2/colors";
import colors_v3 from "tailwindcss/colors";

const colorsToOmit = {
  v1: ["current", "transparent", "black", "white"] as const,
  v2: ["inherit", "current", "transparent", "black", "white"] as const,
  v3: [
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
  ] as const,
};

type AllColors = {
  v1: {
    [key in Exclude<
      keyof typeof colors_v1,
      (typeof colorsToOmit)["v1"][number]
    >]: (typeof colors_v1)[key];
  };
  v2: {
    [key in Exclude<
      keyof typeof colors_v2,
      (typeof colorsToOmit)["v2"][number]
    >]: (typeof colors_v2)[key];
  };
  v3: {
    [key in Exclude<
      keyof typeof colors_v3,
      (typeof colorsToOmit)["v3"][number]
    >]: (typeof colors_v3)[key];
  };
};

const allColors = {
  v1: Object.fromEntries(
    Object.entries(colors_v1).filter(
      ([key]) => !colorsToOmit["v1"].includes(key)
    )
  ),
  v2: Object.fromEntries(
    Object.entries(colors_v2).filter(
      ([key]) => !colorsToOmit["v2"].includes(key)
    )
  ),
  v3: Object.fromEntries(
    Object.entries(colors_v3).filter(
      ([key]) => !colorsToOmit["v3"].includes(key)
    )
  ),
} as AllColors;

export default allColors;
