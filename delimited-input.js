function DelimitedInput(separator, spread, direction, prefill) {
  if (typeof(separator) !== 'string' || separator.length !== 1) {
    throw new Error('Delimiter must be a single character string, got ' +
        typeof(separator) + ' "' + separator + '"');
  }
  const format = DelimitedInput.formatter(separator, spread, direction);

  // "xxx-yyy" -> segmentLength === 4
  const segmentLength = spread + separator.length;

  return function(event) {
    const el = event.target;
    const priorPosition = el.selectionStart;
    const key = String.fromCharCode(event.keyCode);

    if (/[A-z0-9]/.test(key)) {
      event.preventDefault();

      const selectionLength = el.selectionEnd - el.selectionStart;

      if (el.value.length >= el.size && selectionLength === 0) {
        return; // after preventDefault() to avoid changing input value
      }

      const value = DelimitedInput.subtract(
          el.value, el.selectionStart, el.selectionEnd);

      const nextValue = format(DelimitedInput.inject(value, event.shiftKey ? key : key.toLowerCase(), priorPosition));
      const predict = (prefill && nextValue.length < el.size && (nextValue.length + 1) % segmentLength == 0) ? separator : "";

      el.value = nextValue + predict;

      if (direction === DelimitedInput.ltr) {
        // +1 as input is not yet reflected in position
        const next_to_separator = (priorPosition + 1) % segmentLength == 0
            // left of separator, adds +1 more
            || ((priorPosition + 2) % segmentLength == 0);
        const shift = (priorPosition + (next_to_separator ? 2 : 1));
        el.selectionStart = el.selectionEnd = shift;
      } else {
        // Accounts also additional or removed delimiters
        const shift = el.value.length - value.length;
        el.selectionStart = el.selectionEnd = (priorPosition + shift);
      }
    } else if (event.keyCode === 8) {
      event.preventDefault();
      const result = DelimitedInput.backspace(el, separator, direction);
      const newValue = format(result.value);
      el.value = newValue;
      el.selectionStart = el.selectionEnd = (direction === DelimitedInput.ltr)
          ? result.positionFromStart
          : newValue.length - result.positionFromEnd;
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
            ? DelimitedInput.reverse(DelimitedInput.reverse(
                value.replace(reStrip, "")).match(re).join(separator))
            : value.replace(reStrip, "").match(re).join(separator));
  }
};

DelimitedInput.strip = function(string) {
  return string.replace(/[^A-z0-9]/g, '');
};

DelimitedInput.inject = function(string, character, positionFromLeft) {
  return string.slice(0, positionFromLeft) +
      character + string.slice(positionFromLeft);
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

  const cursorRightOfSeparator = selStart > 0
      && value[selStart - 1] === separator[separator.length - 1];
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
            // Erase char before separator if cursor right after of separator
            ? separator.length
            : 0),
        selEnd)
  };
};
