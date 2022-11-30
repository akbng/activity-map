import Color from 'color';

export const getArray = (length: number): number[] => Array.from(new Array(length), (_, i) => i);

/**
 * returns array of hex colors ranging from more intense to less
 */
export const getColorValues = (baseColor: string, intensityVariance: number): string[] =>
  getArray(intensityVariance).map((_, i) =>
    Color(baseColor)
      .lighten(i / intensityVariance)
      .hex()
  );

export const getIntensityGroups = (intensityVariance: number, data: number[]): number[] => {
  const uniqueValues = Array.from(new Set(data)).sort((a, b) => a - b);
  const uniqueLength = uniqueValues.length;

  if (uniqueLength < intensityVariance)
    return [...new Array(intensityVariance - uniqueLength - 1).fill(0), ...uniqueValues];

  const intensityRange = ~~(uniqueLength / (intensityVariance - 2));

  return Array.from(
    new Array(intensityVariance - 1),
    (_, i) => uniqueValues[Math.min(intensityRange * i, uniqueLength - 1)]
  );
};

export const getIntensity = (
  count: number,
  baseColor: string,
  intensityVariance: number,
  intensitySteps: number[]
): string => {
  const colors = getColorValues(baseColor, intensityVariance);

  if (count === 0) return colors.at(-1) as string;

  const index = intensitySteps.findIndex((step) => count <= step) + 1;
  return colors.at(-(index + 1)) as string;
};
