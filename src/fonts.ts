import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { continueRender, delayRender } from "remotion";

// Hold rendering until the brand weights are loaded so no frame uses a fallback.
const handle = delayRender("Loading Montserrat");
Promise.all(
  ["700", "800", "900"].map((w) => document.fonts.load(`${w} 48px Montserrat`, "PRECIO Gs."))
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
