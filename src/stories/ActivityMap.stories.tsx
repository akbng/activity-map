import React from 'react';
import * as sb from '@storybook/react';

import ActivityMap from '../ActivityMap';

export default {
  title: 'ActivityMap',
  component: ActivityMap,
  argTypes: { baseColor: { control: 'color' } },
} as sb.ComponentMeta<typeof ActivityMap>;

const Template: sb.ComponentStory<typeof ActivityMap> = (args) => <ActivityMap {...args} />;

export const Primary = Template.bind({});
