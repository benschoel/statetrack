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

            const update = () => {
                let split = path.split(".");
                for (let i = split.length - 1; i >= 0; i--) {
                    let subPath = split.slice(0, i + 1).join(".");
                    if (listeners[subPath]) {
                        listeners[subPath].forEach((listenerCB) =>
                            listenerCB(getDeep({ ...info }, subPath))
                        );
                    }
                }
            };

            const getRandomID = () => {
                let val = getDeep({ ...info }, path);
                let id = Math.random().toString(36).substr(2, 9);
                if (
                    val &&
                    typeof val === "object" &&
                    Object.keys(val).includes(id)
                )
                    return getRandomID();

                return id;
            };

            const get = (cb) => {
                const p = new Promise((resolve) => {
                    let value = getDeep({ ...info }, path);

                    if (cb) cb(value);
                    resolve(value);
                });

                return p;
            };

            const set = (val, cb) => {
                const p = new Promise((resolve) => {
                    info = setDeep({ ...info }, path, val);

                    update();

                    if (cb) cb();
                    resolve();
                });

                return p;
            };

            const del = (cb) => {
                const p = new Promise((resolve) => {
                    info = deleteDeep({ ...info }, path);

                    update();

                    if (cb) cb();
                    resolve();
                });

                return p;
            };

            const push = (val) => {
                let valAtPath = getDeep({ ...info }, path);

                let s = source(path)(getRandomID());

                if (val) s.set(val);

                return s;
            };

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

            const getKey = () => secondary;

            return {
                source: source(path),
                get,
                set,
                delete: del,
                push,
                listen,
                removeListener,
                getKey,
            };
        };
    };

    return {
        source: source(""),
    };
};

module.exports = State;
