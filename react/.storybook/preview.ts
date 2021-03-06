export const parameters = {
  controls: { expanded: true },
  actions: { argTypesRegex: '^on.*' },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#f5f7f8' },
      { name: 'dark', value: '#282a2c' },
    ],
  },
  options: {
    storySort: {
      order: ['PayCash', 'Button', 'Widget'],
    },
  },
};
