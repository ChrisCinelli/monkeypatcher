function CustomError() {
  const oldStackTrace = Error.prepareStackTrace;
  try {
    Error.prepareStackTrace = function (err, stack) { return stack; };
    Error.captureStackTrace(this);
    this.mystack = this.stack;
  } finally {
    Error.prepareStackTrace = oldStackTrace;
  }
}

export default function getCallers(shouldGetAll) {
  function getModule(file) {
    const match = file.match(/node_modules\/([^/]+)(\/|$)(?!node_modules\/)/);
    return match && match[1];
  }
  try {
    const err = new CustomError();
    const modules = [];
    const files = [];
    let callerfile;
    let callermodule;
    let currentfile;
    let currentmodule;

    // Error.prepareStackTrace = function (err, stack) { return stack; };

    currentfile = err.mystack.shift().getFileName();
    currentmodule = getModule(currentfile);

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();
      callermodule = getModule(callerfile);

      if (callermodule && currentmodule !== callermodule) {
        modules.unshift(callermodule);
        currentmodule = callermodule;
      }

      if (currentfile !== callerfile) {
        if (shouldGetAll) {
          files.unshift(callerfile);
          currentfile = callerfile;
        } else {
          return callerfile;
        }
      }
    }
    return { files, modules };
  } catch (err) {
      // Nothing to do
  }
  return undefined;
}
