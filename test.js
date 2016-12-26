const assert = chai.assert;
const expect = chai.expect;

mocha.setup('bdd');

function input() {
  return document.getElementById('num');
}

function value() {
  return input().value;
}

function caret(index) {
  input().selectionStart = input().selectionEnd = index;
}

function selection(index, length) {
  input().selectionStart = index;
  input().selectionEnd = index + length;
}

const kb = Keysim.Keyboard.US_ENGLISH;

const captureResult = function(func) {
  return function(event) {
    const result = func(event);
    document.getElementById("num_out").value = DelimitedInput.strip(event.target.value);
    document.getElementById("start").value = event.target.selectionStart;
    document.getElementById("end").value = event.target.selectionEnd;
    return result;
  };
};

describe('Product code input', function() {
  const ccDelimiter = captureResult(DelimitedInput("-", 5, DelimitedInput.ltr));

  before(function() {
    document
        .getElementById("num")
        .addEventListener("keydown", ccDelimiter);
    document
        .getElementById("num").style.textAlign = 'left';
  });

  after(function() {
    document
        .getElementById("num")
        .removeEventListener("keydown", ccDelimiter);
  });

  beforeEach(function() {
    input().value = '';
  });

  describe('value for "11111222223"', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('11111222223', input());
    });

    it('outputs "11111-22222-3"', function() {
      assert.equal(value(), '11111-22222-3');
    });

    describe('entering backspace', function() {
      describe('right of first separator', function() {
        beforeEach(function() {
          caret(6);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('outputs "11112-22223"', function() {
          assert.equal(value(), '11112-22223');
        });

        it('selection start after last "1"', function() {
          assert.equal(4, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('after first "2" from left', function() {
        beforeEach(function() {
          caret(7);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('outputs "11111-22223"', function() {
          assert.equal(value(), '11111-22223');
        });

        it('selection start after first separator', function() {
          assert.equal(6, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });
    });
  });

  describe('value for "827419376019585"', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('827419376019585', input());
    });

    it('outputs "82741-93760-19585"', function() {
      assert.equal(value(), '82741-93760-19585');
    });

    describe('entering "1"', function() {
      describe('right of first separator', function() {
        beforeEach(function() {
          caret(6);
          kb.dispatchEventsForInput('1', input());
        });

        it('outputs "82741-19376-01958-5"', function() {
          assert.equal(value(), '82741-19376-01958-5');
        });

        it('selection start after inserted "1"', function() {
          assert.equal(7, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });
    });

    describe('entering backspace', function() {
      describe('in front of value', function() {
        beforeEach(function() {
          caret(0);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('does not modify input', function() {
          assert.equal(value(), '82741-93760-19585');
        });
      });

      describe('after first character', function() {
        beforeEach(function() {
          caret(1);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 8', function() {
          assert.equal(value(), '27419-37601-9585');
        });

        it('selection start before value', function() {
          assert.equal(0, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('after second separator', function() {
        beforeEach(function() {
          caret(12);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 0', function() {
          assert.equal(value(), '82741-93761-9585');
        });

        it('selection start before separator', function() {
          assert.equal(10, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('before second separator', function() {
        beforeEach(function() {
          caret(11);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 0', function() {
          assert.equal(value(), '82741-93761-9585');
        });

        it('selection start before separator', function() {
          assert.equal(10, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('after last character', function() {
        beforeEach(function() {
          caret(value().length);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 5', function() {
          assert.equal(value(), '82741-93760-1958');
        });

        it('selection start at last character', function() {
          assert.equal(input().selectionStart, value().length);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });
    });
  });
});

describe('Creditcard input', function() {
  const ccDelimiter = captureResult(DelimitedInput(" ", 4, DelimitedInput.ltr));

  before(function() {
    document
        .getElementById("num")
        .addEventListener("keydown", ccDelimiter);
  });

  after(function() {
    document
        .getElementById("num")
        .removeEventListener("keydown", ccDelimiter);
  });

  beforeEach(function() {
    input().value = '';
  });

  describe('value for "4820672882915824"', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('4820672882915824', input());
    });

    it('outputs "4820 6728 8291 5824"', function() {
      assert.equal(value(), '4820 6728 8291 5824');
    });
  });
});

describe('Number input', function() {
  const thousandDelimiter = captureResult(DelimitedInput(",", 3, DelimitedInput.rtl));

  before(function() {
    document
        .getElementById("num")
        .addEventListener("keydown", thousandDelimiter);
  });

  after(function() {
    document
        .getElementById("num")
        .removeEventListener("keydown", thousandDelimiter);
  });

  beforeEach(function() {
    input().value = '';
  });

  describe('value for thousand', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('1234', input());
    });

    it('sets delimiter after first number', function() {
      assert.equal(value(), '1,234');
    });

    describe('entering backspace in front of value', function() {
      beforeEach(function() {
        caret(0);
        kb.dispatchEventsForAction('backspace', input());
      });

      it('does not modify input', function() {
        assert.equal(value(), '1,234');
      });
    });
  });

  describe('value for 12,345', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('12345', input());
    });

    it('sets delimiter after second number', function() {
      assert.equal(value(), '12,345');
    });

    describe('selection over 2,3', function() {
      describe('entering backspace', function() {
        beforeEach(function() {
          selection(1, 3);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('leaves 145', function() {
          assert.equal(value(), '145');
        });

        it('leaves cursor right of 1', function() {
          assert.equal(input().selectionStart, 1);
        });
      });
    });

    describe('selection over ,3', function() {
      describe('entering backspace', function() {
        beforeEach(function() {
          selection(2, 2);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('leaves 1,245', function() {
          assert.equal(value(), '1,245');
        });

        it('leaves cursor right of 2', function() {
          assert.equal(input().selectionStart, 3);
        });
      });
    });

    describe('selection over 12', function() {
      beforeEach(function() {
        selection(0, 2);
      });

      describe('entering backspace', function() {
        beforeEach(function() {
          kb.dispatchEventsForAction('backspace', input());
        });

        it('leaves 345', function() {
          assert.equal(value(), '345');
        });

        it('leaves cursor left of 3', function() {
          assert.equal(input().selectionStart, 0);
        });
      });

      describe('entering 9', function() {
        beforeEach(function() {
          kb.dispatchEventsForInput('9', input());
        });

        it('leaves 9,345', function() {
          assert.equal(value(), '9,345');
        });

        it('leaves cursor right of ,', function() {
          assert.equal(input().selectionStart, 1);
        });
      });
    });

    describe('selection over ,', function() {
      describe('entering backspace', function() {
        beforeEach(function() {
          selection(2, 1);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('does not modify the input', function() {
          assert.equal(value(), '12,345');
        });
      });
    });
  });

  describe('value for 1,234,567', function() {
    beforeEach(function() {
      kb.dispatchEventsForInput('1234567', input());
    });

    describe('entering backspace', function() {
      describe('after first character', function() {
        beforeEach(function() {
          caret(1);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 1', function() {
          assert.equal(value(), '234,567');
        });

        it('selection start before value', function() {
          assert.equal(0, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('after second separator', function() {
        beforeEach(function() {
          caret(6);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 4', function() {
          assert.equal(value(), '123,567');
        });

        it('selection start after separator', function() {
          assert.equal(4, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('before second separator', function() {
        beforeEach(function() {
          caret(5);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 4', function() {
          assert.equal(value(), '123,567');
        });

        it('selection start before separator', function() {
          assert.equal(3, input().selectionStart);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });

      describe('after last character', function() {
        beforeEach(function() {
          caret(value().length);
          kb.dispatchEventsForAction('backspace', input());
        });

        it('removes 7', function() {
          assert.equal(value(), '123,456');
        });

        it('selection start at last character', function() {
          assert.equal(input().selectionStart, value().length);
        });

        it('selection length is zero', function() {
          assert.equal(input().selectionStart, input().selectionEnd);
        });
      });
    });
  });
});

describe('Invaid initialization', function() {
  describe('with non-char delimiter', function() {
    var testInit = null;

    beforeEach(function() {
      testInit = function() {
        DelimitedInput("123", 4, DelimitedInput.ltr)
      }
    });

    it('throws exception with correct description', function() {
      expect(testInit).to.throw(Error, /^Delimiter must be a single character string, got string "123"$/);
    });
  });
});

mocha.run();
