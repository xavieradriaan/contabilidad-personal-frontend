export default (isDarkMode) => ({
  particles: {
    number: { value: 50 },
    color: { value: isDarkMode ? '#5D9CEC' : '#001A5C' },
    opacity: { value: 0.5 },
    size: { value: 3 },
    move: { enable: true, speed: 1 }
  }
});
