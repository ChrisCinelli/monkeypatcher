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
        const match = file.match(/node_modules\/([^\/]+)(\/|$)(?!node_modules\/)/)
        return match && match[1];
    }
    try {
        var err = new CustomError();
        var modules = [];
        var files = [];
        var callerfile;
        var callermodule;
        var currentfile;
        var currentmodule;

        //Error.prepareStackTrace = function (err, stack) { return stack; };

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
                if (shouldGetAll){
                    files.unshift(callerfile);
                    currentfile = callerfile;
                } else {
                    return callerfile;
                }
            }
        }
        return { files, modules };

    } catch (err) {}
    return undefined;
}