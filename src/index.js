const getDeep = require("get-value");
const setDeep = require("set-value");
const deleteDeep = require("unset-value");

const State = (defaults) => {
    let info = {
        ...(defaults || {}),
    };

    const listeners = {};

    const source = (primary) => {
        return (secondary) => {
            const path = (primary !== "" ? primary + "." : "") + secondary;

            const get = (cb, err) => {
                const p = new Promise((resolve, reject) => {
                    let value = getDeep({ ...info }, path);

                    if (value === undefined) {
                        if (err) err();
                        resolve();
                        reject();
                    } else {
                        if (cb) cb(value);
                        resolve(value);
                    }
                });

                return p;
            };

            const set = (val, cb) => {
                const p = new Promise((resolve) => {
                    info = setDeep({ ...info }, path, val);
                    if (cb) cb();

                    let split = path.split(".");
                    for (let i = split.length - 1; i >= 0; i--) {
                        let subPath = split.slice(0, i + 1).join(".");
                        if (listeners[subPath]) {
                            listeners[subPath].forEach((listenerCB) =>
                                listenerCB(getDeep({ ...info }, subPath))
                            );
                        }
                    }

                    resolve();
                });

                return p;
            };

            const del = (cb, err) => {};

            const push = (cb, err) => {};

            const listen = (cb) => {
                listeners[path] = (listeners[path] || []).concat(cb);

                get((val) => {
                    cb(val);
                });
            };

            const removeListener = (cb) => {
                listeners[path] = (listeners[path] || []).filter(
                    (c) => c !== cb
                );
            };

            return {
                source: source(path),
                get,
                set,
                delete: del,
                push,
                listen,
                removeListener,
            };
        };
    };

    return {
        source: source(""),
    };
};

module.exports = State;
