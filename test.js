const assert = chai.assert;

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
describe('Input', function() {
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

mocha.run();