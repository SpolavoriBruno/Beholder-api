const { deleteMonitor, getMonitor,
    getMonitors, insertMonitor,
    updateMonitor, getMonitorTypes
} = require('../repositories/monitorsRepository')
const appEM = require('../app-em')
const errorHandler = require('../utils/errorHandler')

exports.getMonitor = (req, res, next) => {
    const id = req.params.id
    getMonitor(id)
        .then(monitor => res.json(monitor.get({ plain: true })))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.getMonitors = (req, res, next) => {
    const page = req.query.page
    getMonitors(page)
        .then(monitors => res.json(monitors))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.getMonitorTypes = (req, res, next) => {
    getMonitorTypes()
        .then(monitorTypes => res.json(monitorTypes))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.startMonitor = async (req, res, next) => {
    const id = req.params.id
    const monitor = await getMonitor(id)
    if (monitor.isActive) return res.sendStatus(204)
    if (monitor.isSystemMon) return res.sendStatus(403)

    appEM.startMonitor(monitor)

    monitor.isActive = true
    await monitor.save()
    res.json(monitor)
}

exports.stopMonitor = async (req, res, next) => {
    const id = req.params.id
    const monitor = await getMonitor(id)
    if (!monitor.isActive) return res.sendStatus(204)
    if (monitor.isSystemMon) return res.sendStatus(403)

    appEM.stopMonitor(monitor)

    monitor.isActive = false
    await monitor.save()
    res.json(monitor.get({ plain: true }))
}

exports.insertMonitor = (req, res, next) => {
    const newMonitor = req.body
    insertMonitor(newMonitor)
        .then(monitor => {
            if (monitor.isActive) {
                appEM.startMonitor(monitor)
            }
            res.json(monitor.get({ plain: true }))
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.updateMonitor = async (req, res, next) => {
    const id = req.params.id
    const newMonitor = req.body

    const currentMonitor = await getMonitor(id)
    if (!currentMonitor) return res.sendStatus(404)
    if (currentMonitor.isSystemMon) return res.sendStatus(403)
    updateMonitor(id, newMonitor)
        .then(monitor => {
            if (monitor.isActive) {
                appEM.stopMonitor(currentMonitor)
                appEM.startMonitor(monitor)
            } else {
                appEM.stopMonitor(currentMonitor)
            }
            res.json(monitor.get({ plain: true }))
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.deleteMonitor = async (req, res, next) => {
    const id = req.params.id

    const currentMonitor = await getMonitor(id)
    if (currentMonitor.isSystemMon) return res.sendStatus(403)

    if (currentMonitor.isActive) {
        appEM.stopMonitor(currentMonitor)
    }

    deleteMonitor(id)
        .then(monitor => res.sendStatus(204))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
