import React, { ReactElement } from 'react';
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
  data?: object; // TODO: describe properly
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

const ActivityMap = ({
  width,
  startDate = subYears(subDays(startOfToday(), 1), 1),
  endDate = startOfToday(),
  cellSize = 12,
  gutterSize = 3,
  cellRadius = 3,
  baseColor = '#666666',
}: IActivityMap): ReactElement => {
  const cellSizeWithGutter = cellSize + gutterSize;
  const numOfDays = differenceInDays(endDate, startDate);
  const emptyDaysAtStart = startDate.getDay();
  const emptyDaysAtEnd = daysInWeek - (endDate.getDay() + 1);
  const numOfWeeks = Math.ceil((emptyDaysAtStart + numOfDays + emptyDaysAtEnd) / daysInWeek);
  const lastCellIndex = emptyDaysAtStart + numOfDays;
  const dateOfFirstCell = subDays(startDate, emptyDaysAtStart);

  return (
    <svg
      width={width || cellSizeWithGutter * numOfWeeks + 40}
      viewBox={`0 0 ${cellSizeWithGutter * numOfWeeks + 40} ${
        cellSizeWithGutter * daysInWeek + 40
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
                  fill={baseColor}
                />
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default ActivityMap;
