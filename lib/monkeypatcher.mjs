import _getCallers from './getCallers.mjs';

/*
 * Monkey patching the methods of an object
 * obj is the object to be monkey patched
 * methods can be a RegExp, the name of the object of the list of objects to be monkey patched,
 *         a method name or an object where the key is the method name and the value is the function to use
 * options:
 *   fn:         is the function to be used with all the methods. It is executed with the same "this" the function was called.
 *               The first param is a digest with "name" of the method, the "oldMetohd" function that is being patched, and
 *               "callers" (see getCallers). The other parameters are the same
 *
 *   debug:      enables some debuggign messaging
 *   getCallers: if true return the file calling the function, if "all" return all the modules and files tat call the function.
 *   extra:      extra params to be passed to the function in the digest
 *
 *   Return:     unpatcher function that when it is called unpatch the object (it does not )
 *
 */


const patchingStr = ' + Patching';

export default function monkeypatcher(
  obj,
  methods,
  {
    fn,
    getCallers = 'all',
    extra,
    // no log by default
    log = function () {return true;}
} = {}) {
  // if "log" is a function use that to log
  if (typeof(originalLog) === 'function') {
    const originalLog = log;
    log = function logWrapper() {
      originalLog.apply(this, arguments);
      return true;
    }
  // if "log" is true use console.debug
  } else if (originalLog === true) {
    log = function consoleLog() {
      // eslint-disable-next-line no-console
      console.debug.apply(console, arguments);
      return true;
    };
  }

  const oldFn = {};

  for (const methodName in obj) {
    const method = obj[methodName];
    let match;
    if (
    // All function in the object
      methods === '*' && typeof method === 'function' && log(patchingStr, methodName)

      // Only one method
          || typeof(methods) === 'string' && methodName === methods && typeof method === 'function'
      // Only the method in the array
          || Array.isArray(methods) && methods.includes(methodName)
      // Only the one matching the regex
          || methods instanceof RegExp && (match = methodName.match(methods))
      // Object with 'methodName': functionForThisMethod
          || typeof(methods) === 'object' && methods[methodName] && (fn = methods[methodName])
    ) {
      oldFn[methodName] = method;
      const oldMethod = method;
      const name = methodName;
      const _fn = fn;

      obj[methodName] = function () {
        const info = { name, oldMethod };
        if (extra) info.extra = extra;
        if (match) info.match = match;
        if (getCallers) {
          info.callers = _getCallers(getCallers == 'all');
        }
        let ret = _fn.apply(obj, [info, ...arguments]);

        // By default the original funcion will be executed but
        // this beahavior can be overrided returning: {
        //   executeOriginal: false
        //   ret : returnValueFromNewFunction
        // }
        let executeOriginal = true;
        if (ret && ret.executeOriginal !== undefined) {
          ret = ret.result;
          executeOriginal = ret.executeOriginal;
        }
        if (executeOriginal) ret = oldMethod.apply(obj, arguments);
        return ret;
      };
    } else {
      log('   Skipping', methodName);
    }
  }

  // call this to unpatch
  return function unpatcher() {
    for (const methodName in oldFn) {
      obj[methodName] = oldFn[methodName];
    }
  };
}
