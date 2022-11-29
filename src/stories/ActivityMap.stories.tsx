import React from 'react';
import * as sb from '@storybook/react';
import { addDays, differenceInDays, format, startOfToday, subYears } from 'date-fns';

import ActivityMap from '../ActivityMap';

const generateRandomNumbers = (min = 0, max = 100) => Math.round(Math.random() * (max - min) + min);

const generateData = (startDate: Date, endDate: Date): Array<{ date: string; count: number }> =>
  new Array(differenceInDays(endDate, startDate)).fill(0).map((_, i) => ({
    date: format(addDays(startDate, i), 'yyyy-MM-dd'),
    count: generateRandomNumbers(0, 25),
  }));

export default {
  title: 'ActivityMap',
  component: ActivityMap,
  argTypes: { baseColor: { control: 'color' } },
} as sb.ComponentMeta<typeof ActivityMap>;

const Template: sb.ComponentStory<typeof ActivityMap> = (args) => <ActivityMap {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  values: generateData(subYears(startOfToday(), 1), startOfToday()),
  baseColor: '#ff0000',
};
