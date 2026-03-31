export function percentLabel(value: number) {
  return `${value}%`;
}

export function confidenceTone(confidence: "low" | "medium" | "high") {
  switch (confidence) {
    case "high":
      return "Ready for viva";
    case "medium":
      return "Needs one more pass";
    default:
      return "Weak area to revisit";
  }
}

