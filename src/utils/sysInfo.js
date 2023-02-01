const prefix = "[System Informations] -"

module.exports = {
    heapSize: () => ({
        info: "Heap Size",
        value: require('node:v8').getHeapStatistics().heap_size_limit / (1024 * 1024)
    }),

    /**
     * 
     * @param {Function} cb default: console.log
     * @returns undefined
     */
    all: function (cb) {
        const self = this
        for (sysInfo in self) {
            if (sysInfo === arguments.callee.name) return

            const { info, value } = self[sysInfo]()

            if (cb && cb instanceof Function) {
                cb(prefix, info, value)
            } else
                console.log(prefix, info, value)
        }
    }
}
