function DelimitedInput(separator, spread) {
  const format = DelimitedInput.formatter(separator, spread);

  return function(event) {
    const priorPosition = event.target.selectionStart;
    const key = String.fromCharCode(event.keyCode);

    if (/[0-9]/.test(key)) {
      event.preventDefault();

      const value = DelimitedInput.subtract(event.target.value, event.target.selectionStart, event.target.selectionEnd);
      event.target.value = format(DelimitedInput.inject(value, key, priorPosition));

      const shift = event.target.value.length - value.length;

      event.target.selectionStart = priorPosition + shift;
      event.target.selectionEnd = priorPosition + shift;
    } else if (event.keyCode === 8) {
      event.preventDefault();
      const result = DelimitedInput.backspace(event.target, separator);
      const newValue = format(result.value);
      event.target.value = newValue;
      event.target.selectionStart = event.target.selectionEnd = newValue.length - result.positionFromEnd;
    }
  }
}

DelimitedInput.reverse = function(string) {
  return string.split("").reverse().join("");
};

DelimitedInput.formatter = function(separator, spread) {
  const re = new RegExp(".{1," + spread + "}", "g");
  const reStrip = new RegExp(separator, "g");

  return function(value) {
    return value.length === 0
        ? ""
        : DelimitedInput.reverse(DelimitedInput.reverse(value.replace(reStrip, "")).match(re).join(separator));
  }
};

DelimitedInput.strip = function(string) {
  return string.replace(/[^0-9]/g, '');
};

DelimitedInput.inject = function(string, character, positionFromLeft) {
  return (string.slice(0, positionFromLeft) + character + string.slice(positionFromLeft));
};

DelimitedInput.subtract = function(string, start, end) {
  const head = string.slice(0, start);
  const tail = string.slice(end, string.length);

  return head + tail;
};

DelimitedInput.backspace = function(el, separator) {
  const value = el.value;

  const selStart = el.selectionStart;
  const selEnd = el.selectionEnd;
  const selLength = selEnd - selStart;

  const cursorRightOfSeparator = selStart > 0 && value[selStart - 1] === separator[separator.length - 1];
  const cursorPosition = Math.max(0, selStart - (selLength ? 0  : 1));

  return {
    positionFromEnd: value.length - selEnd, // Input modification will reformat only for the beginning of the string
    value: this.subtract(value, cursorPosition - (cursorRightOfSeparator
            ? separator.length // Erase char before separator if cursor right after of separator
            : 0),
        selEnd)
  };
};
