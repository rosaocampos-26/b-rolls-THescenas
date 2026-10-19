import { Composition } from "remotion";
import "./fonts";
import { VERTICAL } from "./brand";
import { ExpectedVsMarket } from "./scenes/ExpectedVsMarket/ExpectedVsMarket";
import { DURATION } from "./scenes/ExpectedVsMarket/timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ExpectedVsMarket"
    component={ExpectedVsMarket}
    durationInFrames={DURATION}
    fps={VERTICAL.fps}
    width={VERTICAL.width}
    height={VERTICAL.height}
  />
);
