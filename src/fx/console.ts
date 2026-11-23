let printed = false;

export function consoleBanner() {
  if (printed) return;
  printed = true;
  const big = "font: 900 28px Unbounded, sans-serif; color:#C6FF00; background:#07070A; padding:12px 18px; text-shadow: 3px 0 #FF2E88, -3px 0 #00E5FF;";
  const mono = "font: 12px 'JetBrains Mono', monospace; color:#e8e8ea;";
  const hot = "font: 700 12px 'JetBrains Mono', monospace; color:#FF2E88;";
  console.log("%cASAF.EXE", big);
  console.log("%cOh, you open DevTools on portfolios too. Respect.", mono);
  console.log("%cNo template, no page builder. Hand-written TypeScript + GLSL.", mono);
  console.log("%cCheat code: ↑ ↑ ↓ ↓ ← → ← → B A", hot);
  console.log("%cHiring? → asafarusi2@gmail.com", hot);
}
