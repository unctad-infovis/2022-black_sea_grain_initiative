const debounce = (func, time) => {
  time = time || 100;
  let timer;
  return (event) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, time, event);
  };
};

export default debounce;
