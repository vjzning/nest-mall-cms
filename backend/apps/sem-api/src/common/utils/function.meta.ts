export default {
  random: {
    name: 'random',
    description: 'Generate a random number between min and max',
    params: [
      {
        name: 'min',
        type: 'number',
        description: '最小值',
      },
      {
        name: 'max',
        type: 'number',
        description: '最大值',
      },
    ],
  },
  eventAmount: {
    name: 'eventAmount',
    description: 'Get the amount of current events',
  },
};
