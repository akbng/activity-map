import React, { ReactElement, useMemo } from 'react';
import Color from 'color';
import { differenceInDays, startOfToday, subDays, subYears, addDays } from 'date-fns';

export interface IActivityMap {
  width?: number | string;
  startDate?: Date;
  endDate?: Date;
  cellSize?: number;
  cellRadius?: number | string;
  circleCells?: boolean;
  gutterSize?: number;
  baseColor?: string;
  weekLabelPattern?: string | string[];
  intensityVariance?: number;
  values: Array<{ count: number; date: string }>; // TODO: describe properly
  // May add more properties later
}

const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS_OF_YEAR = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];
const daysInWeek = DAYS_OF_WEEK.length;
const monthsInYear = MONTHS_OF_YEAR.length;

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

const getIntensity = (
  count: number,
  baseColor: string,
  intensityVariance: number,
  intensitySteps: number[]
) => {
  const color = Color(baseColor);

  if (count === 0) return color.lighten((intensityVariance + 1) / intensityVariance).hex();

  // if (count >= Math.max(...intensitySteps)) return color.hex(); // TODO: highest intensity

  const index = intensitySteps.findIndex((step) => count <= step) + 1;
  return color.lighten((intensityVariance - index - 1) / intensityVariance).hex();
};

const ActivityMap = ({
  width,
  startDate = subYears(subDays(startOfToday(), 1), 1),
  endDate = startOfToday(),
  cellSize = 12,
  gutterSize = 3,
  cellRadius = 3,
  baseColor = '#666666',
  values = [],
  intensityVariance = 4,
}: IActivityMap): ReactElement => {
  const cellSizeWithGutter = cellSize + gutterSize;
  const numOfDays = differenceInDays(endDate, startDate);
  const emptyDaysAtStart = startDate.getDay();
  const emptyDaysAtEnd = daysInWeek - (endDate.getDay() + 1);
  const numOfWeeks = Math.ceil((emptyDaysAtStart + numOfDays + emptyDaysAtEnd) / daysInWeek);
  const lastCellIndex = emptyDaysAtStart + numOfDays;
  const dateOfFirstCell = subDays(startDate, emptyDaysAtStart);
  const intensitySteps = useMemo(
    () =>
      getIntensityGroups(
        intensityVariance,
        values.map((value) => value.count)
      ),
    [values]
  );
  const cellValues = useMemo<Record<number, { count: number; date: Date; intensity: string }>>(
    () =>
      values.reduce((acx, value) => {
        const date = new Date(value.date);
        const cellIndex = differenceInDays(date, dateOfFirstCell);
        if (cellIndex < 0) return acx;

        acx[cellIndex] = {
          ...value,
          date,
          intensity: getIntensity(value.count, baseColor, intensityVariance, intensitySteps),
        };
        return acx;
      }, Object.create(null)),
    [values, baseColor, intensityVariance]
  );

  console.log(Color(baseColor).isLight());

  return (
    <svg
      width={width || cellSizeWithGutter * numOfWeeks + 40}
      viewBox={`0 0 ${cellSizeWithGutter * numOfWeeks + 40} ${
        cellSizeWithGutter * daysInWeek + 70
      }`}
    >
      <g transform={`translate(0, 40)`}>
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <text key={dayIndex} x={0} y={(dayIndex + 1) * cellSize + dayIndex * gutterSize}>
            {day}
          </text>
        ))}
      </g>
      <g transform="translate(40, 0)">
        {Array.from(new Array(numOfWeeks), (_, i) => i).map((weekIndex) => {
          const firstDateOfWeek = addDays(dateOfFirstCell, weekIndex * daysInWeek);
          return firstDateOfWeek.getDate() >= daysInWeek &&
            firstDateOfWeek.getDate() < 2 * daysInWeek ? (
            <text key={firstDateOfWeek.getMilliseconds()} x={weekIndex * cellSizeWithGutter} y={20}>
              {MONTHS_OF_YEAR[firstDateOfWeek.getMonth()]}
            </text>
          ) : null;
        })}
      </g>
      <g transform="translate(40, 40)">
        {Array.from(new Array(numOfWeeks), (_, i) => i).map((weekIndex) => (
          <g key={weekIndex} transform={`translate(${cellSizeWithGutter * weekIndex}, 0)`}>
            {Array.from(new Array(daysInWeek), (_, i) => i).map((dayIndex) => {
              const cellIndex = weekIndex * daysInWeek + dayIndex;

              if (cellIndex < emptyDaysAtStart || cellIndex > lastCellIndex) return null;

              return (
                <rect
                  key={cellIndex}
                  id={`${cellIndex}`}
                  x={0}
                  y={dayIndex * cellSizeWithGutter}
                  width={cellSize}
                  height={cellSize}
                  rx={cellRadius}
                  fill={cellValues[cellIndex]?.intensity || Color(baseColor).lighten(0.75).hex()}
                />
              );
            })}
          </g>
        ))}
      </g>
      <g transform={`translate(40, ${cellSizeWithGutter * daysInWeek + 50})`}>
        <text x={0} y={cellSize}>
          More
        </text>
        {Array.from(new Array(intensityVariance), (_, i) => i).map((variance) => (
          <rect
            key={variance}
            x={variance * cellSizeWithGutter + 40}
            y={0}
            width={cellSize}
            height={cellSize}
            rx={cellRadius}
            fill={Color(baseColor)
              .lighten(variance / intensityVariance)
              .hex()}
          />
        ))}
        <text x={intensityVariance * cellSizeWithGutter + 40} y={cellSize}>
          Less
        </text>
      </g>
    </svg>
  );
};

export default ActivityMap;
