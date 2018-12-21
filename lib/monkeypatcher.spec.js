import monkeypatcher from './monkeypatcher.mjs';

describe('methods', () => {
  let obj;

  function patcher (methods, opts) {
    const method1 = jest.fn(() => 1);
    const method2 = jest.fn(() => 2);
    const method3 = jest.fn(() => 3);
    const add2and3 = jest.fn(() => this.method2() + this.method3());
    const add = jest.fn((a, b) => a + b);
    const asyncAddCb = jest.fn((r) => r);
    const asyncAdd = jest.fn((a, b, cb) => {
       setImmediate(() => cb(asyncAddCb(a + b))); 
    });

    const ret = {
      method1,
      method2,
      method3,
      add,
      add2and3,
      asyncAddCb,
      asyncAdd,
      obj: {
        method1,
        method2,
        method3,
        add2and3,
        add,
        asyncAdd,
      }
    };

    monkeypatcher(ret.obj, methods, opts);
    obj();
    return ret;
  }

  it('RegEx', () => {
    patcher(/^(.*)?Add(.*)?/);
    expect(obj.add2and3()).toBe(5);

    expect(obj.add2and3).toHaveBeenCalled(1);
    expect(obj.method1).toHaveBeenCalled(1);
    expect(obj.method2).toHaveBeenCalled(1);
  });
});
