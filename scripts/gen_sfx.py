"""Procedurally synthesize the scene's sound effects (no samples, no music).

Every file is generated from noise and sine partials with a fixed seed, so the
output is deterministic and fully original — no third-party licensing.

  python3 scripts/gen_sfx.py      -> public/sfx/*.wav (48 kHz, 16-bit stereo)
"""
import wave
from pathlib import Path

import numpy as np

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(26)


def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(SR * dur)) / SR


def one_pole_lp(x: np.ndarray, cutoff: np.ndarray | float) -> np.ndarray:
    """Time-varying one-pole low-pass (cutoff in Hz, scalar or per-sample)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def bandpass(x: np.ndarray, lo, hi) -> np.ndarray:
    return one_pole_lp(x, hi) - one_pole_lp(x, lo)


def pan(mono: np.ndarray, position: np.ndarray | float) -> np.ndarray:
    """Equal-power pan; position -1 (left) .. 1 (right), scalar or per-sample."""
    p = np.broadcast_to(np.asarray(position, dtype=np.float64), mono.shape)
    theta = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(theta), mono * np.sin(theta)], axis=1)


def fade(x: np.ndarray, fin: float = 0.002, fout: float = 0.01) -> np.ndarray:
    n_in, n_out = int(SR * fin), int(SR * fout)
    env = np.ones(len(x))
    if n_in:
        env[:n_in] = np.linspace(0, 1, n_in)
    if n_out:
        env[-n_out:] = np.linspace(1, 0, n_out)
    return x * (env[:, None] if x.ndim == 2 else env)


def write(name: str, stereo: np.ndarray, peak_db: float) -> None:
    stereo = fade(stereo)
    stereo = stereo / (np.max(np.abs(stereo)) + 1e-9) * 10 ** (peak_db / 20)
    data = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"{name}.wav  {len(stereo) / SR:.2f}s  peak {peak_db} dBFS")


def whoosh(dur: float, peak: float, pan_from: float, pan_to: float, bright: float) -> np.ndarray:
    """Airy swell: band-passed noise whose band sweeps up then settles."""
    t = t_axis(dur)
    x = t / dur
    env = np.sin(np.pi * np.clip(x / 0.9, 0, 1) ** 0.8) ** 2
    hi = 600 + bright * (np.sin(np.pi * np.clip(x / peak, 0, 1) * 0.5) ** 2) * (1 - 0.5 * x)
    noise = rng.standard_normal(len(t))
    body = bandpass(noise, hi * 0.25, hi) * env
    air = bandpass(rng.standard_normal(len(t)), 2500, 7000) * env**2 * 0.15
    mono = body + air
    position = pan_from + (pan_to - pan_from) * np.clip(x / peak, 0, 1) ** 0.7
    return pan(mono, position)


def click(pan_pos: float, tone: float, weight: float) -> np.ndarray:
    """Refined plastic/metal latch click: transient + short resonant body."""
    t = t_axis(0.12)
    tick = rng.standard_normal(len(t)) * np.exp(-t / 0.0012)
    tick = bandpass(tick, 1800, 9000)
    body = np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.018) * 0.5
    body += np.sin(2 * np.pi * tone * 1.62 * t) * np.exp(-t / 0.010) * 0.25
    thump = np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.02) * weight
    return pan(tick * 1.2 + body + thump, pan_pos)


def coin(pan_pos: float, f0: float, decay: float) -> np.ndarray:
    """Light metallic coin-on-stack clink: inharmonic partials + contact tick."""
    t = t_axis(0.45)
    ratios = [1.0, 1.51, 2.31, 2.97, 3.82]
    amps = [1.0, 0.6, 0.45, 0.3, 0.18]
    mono = np.zeros(len(t))
    for r, a in zip(ratios, amps):
        f = f0 * r * (1 + rng.uniform(-0.004, 0.004))
        beat = 1 + 0.08 * np.sin(2 * np.pi * rng.uniform(3, 9) * t)
        mono += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / (decay / r**0.6)) * beat
    contact = bandpass(rng.standard_normal(len(t)), 2500, 12000) * np.exp(-t / 0.002) * 0.9
    low = np.sin(2 * np.pi * 380 * t) * np.exp(-t / 0.012) * 0.35
    return pan(mono * 0.55 + contact + low, pan_pos)


def impact() -> np.ndarray:
    """Tight cinematic hit: pitched-down sub thump + short noise crack + tail."""
    t = t_axis(1.2)
    freq = 46 + 70 * np.exp(-t / 0.05)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(phase) * np.exp(-t / 0.28)
    crack = bandpass(rng.standard_normal(len(t)), 300, 5000) * np.exp(-t / 0.018) * 0.9
    body = bandpass(rng.standard_normal(len(t)), 80, 900) * np.exp(-t / 0.12) * 0.5
    sheen = bandpass(rng.standard_normal(len(t)), 4000, 11000) * np.exp(-t / 0.25) * 0.06
    mono = sub * 1.1 + crack + body
    stereo = pan(mono, 0.0)
    # A touch of width on the sheen only, decorrelated per side.
    stereo[:, 0] += sheen
    stereo[:, 1] += np.roll(sheen, 211)
    return np.tanh(stereo * 1.4)


def shimmer(pan_pos: float) -> np.ndarray:
    """Very subtle sparkle accent for the little highlight dashes."""
    t = t_axis(0.6)
    mono = np.zeros(len(t))
    for i, f in enumerate([3520, 4186, 5274, 6272]):
        start = i * 0.035
        tt = np.clip(t - start, 0, None)
        mono += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.12) * (t >= start) * (0.9 - i * 0.15)
    mono += bandpass(rng.standard_normal(len(t)), 5000, 12000) * np.exp(-t / 0.08) * 0.2
    return pan(mono, pan_pos)


def air_swell(dur: float) -> np.ndarray:
    """Barely-there low air movement under the camera push-in."""
    t = t_axis(dur)
    x = t / dur
    env = np.sin(np.pi * x) ** 2
    mono = bandpass(rng.standard_normal(len(t)), 120, 900 + 900 * x) * env
    return np.stack([mono, np.roll(mono, 400)], axis=1)


def main() -> None:
    write("camera_air", air_swell(0.9), -26)
    write("whoosh_left", whoosh(0.75, 0.55, -0.85, -0.3, 3200), -9)
    write("click_tag", click(-0.35, 2350, 0.35), -10)
    write("whoosh_right", whoosh(0.6, 0.5, 0.85, 0.3, 4200), -10)
    write("tick_tag_soft", click(0.35, 2650, 0.15), -19)
    for i, (p, f0, d) in enumerate(
        [(-0.45, 3150, 0.16), (-0.4, 3420, 0.14), (-0.5, 2980, 0.17), (-0.42, 3600, 0.13)]
    ):
        write(f"coin_left_{i}", coin(p, f0, d), -15)
    for i, (p, f0, d) in enumerate([(0.42, 3300, 0.15), (0.48, 3060, 0.16)]):
        write(f"coin_right_{i}", coin(p, f0, d), -15)
    write("impact", impact(), -4)
    write("shimmer", shimmer(0.0), -24)


if __name__ == "__main__":
    main()
