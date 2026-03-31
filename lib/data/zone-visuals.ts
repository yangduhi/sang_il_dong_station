export type ZoneVisual = {
  zoneName: string;
  center: { x: number; y: number };
  label: { x: number; y: number };
  polygon: string;
};

export const mapFocusPoint = {
  x: 760,
  y: 212
};

export const zoneVisuals: Record<string, ZoneVisual> = {
  "강동·송파": {
    zoneName: "강동·송파",
    center: { x: 760, y: 250 },
    label: { x: 788, y: 228 },
    polygon: "730,188 804,180 860,232 846,304 764,318 712,270"
  },
  "강남·서초": {
    zoneName: "강남·서초",
    center: { x: 640, y: 304 },
    label: { x: 642, y: 336 },
    polygon: "586,248 694,236 740,290 708,362 604,372 560,314"
  },
  "도심(종로·중구·용산)": {
    zoneName: "도심(종로·중구·용산)",
    center: { x: 512, y: 238 },
    label: { x: 480, y: 208 },
    polygon: "456,176 554,170 594,222 564,286 474,286 432,226"
  },
  동북: {
    zoneName: "동북",
    center: { x: 626, y: 144 },
    label: { x: 648, y: 116 },
    polygon: "562,76 660,76 722,140 704,216 596,210 542,144"
  },
  서북: {
    zoneName: "서북",
    center: { x: 366, y: 162 },
    label: { x: 314, y: 132 },
    polygon: "286,100 394,86 450,146 430,228 336,238 274,176"
  },
  서남: {
    zoneName: "서남",
    center: { x: 348, y: 334 },
    label: { x: 296, y: 372 },
    polygon: "258,264 388,250 446,322 420,420 306,438 230,360"
  },
  "하남·구리·남양주": {
    zoneName: "하남·구리·남양주",
    center: { x: 900, y: 170 },
    label: { x: 890, y: 122 },
    polygon: "856,98 944,104 976,164 948,240 874,236 832,176"
  },
  "성남·광주·이천·여주·양평": {
    zoneName: "성남·광주·이천·여주·양평",
    center: { x: 846, y: 372 },
    label: { x: 872, y: 404 },
    polygon: "778,298 898,292 960,360 928,444 816,454 750,390"
  },
  "용인·수원·화성·오산·평택·안성": {
    zoneName: "용인·수원·화성·오산·평택·안성",
    center: { x: 672, y: 470 },
    label: { x: 704, y: 516 },
    polygon: "584,388 726,390 802,468 756,572 628,578 546,496"
  },
  "안양·군포·의왕·과천·광명·부천": {
    zoneName: "안양·군포·의왕·과천·광명·부천",
    center: { x: 452, y: 474 },
    label: { x: 402, y: 524 },
    polygon: "356,400 516,404 578,480 520,586 394,582 332,492"
  },
  "시흥·안산": {
    zoneName: "시흥·안산",
    center: { x: 262, y: 480 },
    label: { x: 194, y: 522 },
    polygon: "170,410 306,412 350,488 304,572 182,566 132,484"
  },
  "고양·파주·김포": {
    zoneName: "고양·파주·김포",
    center: { x: 200, y: 206 },
    label: { x: 138, y: 164 },
    polygon: "94,120 246,112 314,190 280,282 146,286 82,206"
  },
  "의정부·양주·동두천·포천·연천·가평": {
    zoneName: "의정부·양주·동두천·포천·연천·가평",
    center: { x: 544, y: 52 },
    label: { x: 540, y: 24 },
    polygon: "472,6 598,10 658,66 628,132 516,126 456,74"
  },
  기타: {
    zoneName: "기타",
    center: { x: 916, y: 526 },
    label: { x: 916, y: 556 },
    polygon: "870,474 956,482 984,542 936,596 858,586 834,528"
  }
};

function buildFallbackPolygon(centerX: number, centerY: number) {
  const size = 24;
  return [
    `${centerX},${centerY - size}`,
    `${centerX + size},${centerY}`,
    `${centerX},${centerY + size}`,
    `${centerX - size},${centerY}`
  ].join(" ");
}

export function resolveFlowVisual(zoneName: string, index: number, total: number): ZoneVisual {
  const exact = zoneVisuals[zoneName];
  if (exact) {
    return exact;
  }

  const angle = ((Math.PI * 2) / Math.max(total, 1)) * index - Math.PI / 2;
  const ringRadius = 235;
  const center = {
    x: mapFocusPoint.x - 140 + Math.cos(angle) * ringRadius,
    y: mapFocusPoint.y + 140 + Math.sin(angle) * ringRadius
  };

  return {
    zoneName,
    center,
    label: {
      x: center.x + 18,
      y: center.y - 14
    },
    polygon: buildFallbackPolygon(center.x, center.y)
  };
}
