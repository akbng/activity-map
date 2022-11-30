import React, { CSSProperties, ReactElement, useMemo } from 'react';
import { differenceInDays, startOfToday, subDays, subYears, addDays, daysInWeek } from 'date-fns';
import { getArray, getColorValues, getIntensity, getIntensityGroups } from '../utils';
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from '../CONSTANTS';

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
  values: Array<{ count: number; date: string }>;
  colors?: string[];
  // May add more properties later
}

const labelStyle: CSSProperties = {
  fontSize: '12',
  lineHeight: '18',
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  textTransform: 'uppercase',
  fill: '#4a4a4a',
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
  colors = getColorValues(baseColor, intensityVariance),
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

  return (
    <svg
      width={width || cellSizeWithGutter * numOfWeeks + 40}
      viewBox={`0 0 ${cellSizeWithGutter * numOfWeeks + 40} ${
        cellSizeWithGutter * daysInWeek + 70
      }`}
    >
      <g transform={`translate(0, 40)`}>
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <text
            key={dayIndex}
            x={0}
            y={(dayIndex + 1) * cellSize + dayIndex * gutterSize}
            style={labelStyle}
          >
            {day.substring(0, 3)}
          </text>
        ))}
      </g>
      <g transform="translate(40, 0)">
        {getArray(numOfWeeks).map((weekIndex) => {
          const firstDateOfWeek = addDays(dateOfFirstCell, weekIndex * daysInWeek);
          return firstDateOfWeek.getDate() >= daysInWeek &&
            firstDateOfWeek.getDate() < 2 * daysInWeek ? (
            <text
              key={firstDateOfWeek.getMilliseconds()}
              x={weekIndex * cellSizeWithGutter}
              y={20}
              style={labelStyle}
            >
              {MONTHS_OF_YEAR[firstDateOfWeek.getMonth()].substring(0, 3)}
            </text>
          ) : null;
        })}
      </g>
      <g transform="translate(40, 40)">
        {getArray(numOfWeeks).map((weekIndex) => (
          <g key={weekIndex} transform={`translate(${cellSizeWithGutter * weekIndex}, 0)`}>
            {getArray(daysInWeek).map((dayIndex) => {
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
                  fill={cellValues[cellIndex]?.intensity || colors.at(-1)}
                />
              );
            })}
          </g>
        ))}
      </g>
      <g transform={`translate(40, ${cellSizeWithGutter * daysInWeek + 50})`}>
        <text x={0} y={cellSize} style={labelStyle}>
          More
        </text>
        {colors.map((color, index) => (
          <rect
            key={index}
            x={index * cellSizeWithGutter + 40}
            y={0}
            width={cellSize}
            height={cellSize}
            rx={cellRadius}
            fill={color}
          />
        ))}
        <text x={intensityVariance * cellSizeWithGutter + 40} y={cellSize} style={labelStyle}>
          Less
        </text>
      </g>
    </svg>
  );
};

export default ActivityMap;
