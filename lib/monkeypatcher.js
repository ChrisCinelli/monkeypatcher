import _getCallers from './getCallers';

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

export default function monkeypatcher(obj, methods, {fn, debug = false, getCallers = 'all', extra} = {}) {
    const oldFn = {};

    for (let methodName in obj) {
        const method = obj[methodName];
        if (
             // All function in the object
             methods === '*' && typeof method === 'function'
             // Only one method
          || typeof(methods) === 'string' &&  methodName === methods && typeof method === 'function'
             //Only the method in the array
          || Array.isArray(methods) && methods.includes(methodName)
             // Only the one matching the regex
          || methods instanceof RegExp && methods.test(methodName)
             // Object with 'methodName': functionForThisMethod
          || typeof(methods) === 'object' && methods[methodName] && (fn = methods[methodName])
        ) {
            if (debug) console.info(' + Patching', methodName);
            oldFn[methodName] = method;
            const oldMethod = method;
            const name = methodName;

            obj[methodName] = function() {
              const info = { name, oldMethod };
              if (extra) info.extra = extra;
              if (getCallers) {
                  const callers = info.callers = _getCallers(getCallers == 'all');
                  if (getCallers == 'all') {
                    callers.files.pop();
                  }
              }
              let ret = fn.apply(obj, [info, ...arguments]);
              let executeOriginal = true;
              if (ret && ret.executeOriginal !== undefined) {
                ret = ret.result
                executeOriginal = ret.executeOriginal;
              }
              if (executeOriginal) ret = oldMethod.apply(obj, arguments);
              return ret;
            }
        } else {
            if (debug) console.info('   Skipping', methodName);
        }
    }

    // call this to unpatch
    return function unpatcher () {
        for (methodName in oldFn) {
            obj[methodName] = oldFn[methodName];
        }
    }
}