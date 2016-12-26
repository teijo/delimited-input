function DelimitedInput(separator, spread, direction) {
  const format = DelimitedInput.formatter(separator, spread, direction);

  // "xxx-yyy" -> segmentLength === 4
  const segmentLength = spread + separator.length;

  return function(event) {
    const priorPosition = event.target.selectionStart;
    const key = String.fromCharCode(event.keyCode);

    if (/[0-9]/.test(key)) {
      event.preventDefault();

      const value = DelimitedInput.subtract(event.target.value, event.target.selectionStart, event.target.selectionEnd);
      event.target.value = format(DelimitedInput.inject(value, key, priorPosition));

      if (direction === DelimitedInput.ltr) {
        // +1 as input is not yet reflected in position
        const next_to_separator = ((priorPosition + 1) % segmentLength == 0 // right of separator
            || (priorPosition + 2) % segmentLength == 0); // left of separator, adds +1 more
        const shift = (priorPosition + (next_to_separator ? 2 : 1));
        event.target.selectionStart = event.target.selectionEnd = shift;
      } else {
        // Accounts also additional or removed delimiters
        const shift = event.target.value.length - value.length;
        event.target.selectionStart = event.target.selectionEnd = (priorPosition + shift);
      }
    } else if (event.keyCode === 8) {
      event.preventDefault();
      const result = DelimitedInput.backspace(event.target, separator, direction);
      const newValue = format(result.value);
      event.target.value = newValue;
      if (direction === DelimitedInput.ltr) {
        event.target.selectionStart = event.target.selectionEnd = result.positionFromStart;
      } else {
        event.target.selectionStart = event.target.selectionEnd = newValue.length - result.positionFromEnd;
      }
    }
  }
}

DelimitedInput.ltr = {}; // Apply rules left-to-right
DelimitedInput.rtl = {}; // Apply rules right-to-left

DelimitedInput.reverse = function(string) {
  return string.split("").reverse().join("");
};

DelimitedInput.formatter = function(separator, spread, direction) {
  const re = new RegExp(".{1," + spread + "}", "g");
  const reStrip = new RegExp(separator, "g");

  return function(value) {
    return value.length === 0
        ? ""
        : (direction === DelimitedInput.rtl
            ? DelimitedInput.reverse(DelimitedInput.reverse(value.replace(reStrip, "")).match(re).join(separator))
            : value.replace(reStrip, "").match(re).join(separator));
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

DelimitedInput.backspace = function(el, separator, direction) {
  const value = el.value;

  const selStart = el.selectionStart;
  const selEnd = el.selectionEnd;
  const selLength = selEnd - selStart;

  const cursorRightOfSeparator = selStart > 0 && value[selStart - 1] === separator[separator.length - 1];
  const cursorPosition = Math.max(0, selStart - (selLength ? 0  : 1));

  // In RTL delimiters never change on right side of the cursor when erasing
  const positionFromEnd = value.length - selEnd;

  // In LTR at most additional separator is removed, delimiters may change on
  // right hand side of the cursor
  const positionFromStart = selStart - (cursorRightOfSeparator ? 2 : 1);

  return {
    positionFromEnd: positionFromEnd,
    positionFromStart: positionFromStart,
    value: this.subtract(value, cursorPosition - (cursorRightOfSeparator
            ? separator.length // Erase char before separator if cursor right after of separator
            : 0),
        selEnd)
  };
};
