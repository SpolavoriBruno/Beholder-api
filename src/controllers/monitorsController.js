const { deleteMonitor, getMonitor, getMonitors, insertMonitor, updateMonitor, } = require('../repositories/monitorsRepository')
const appEM = require('../app-em')

exports.getMonitor = (req, res, next) => {
    const id = req.params.id
    getMonitor(id)
        .then(monitor => res.json(monitor.get({ plain: true })))
        .catch(next)

}

exports.getMonitors = (req, res, next) => {
    const page = req.query.page
    getMonitors(page)
        .then(monitors => res.json(monitors))
        .catch(next)
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
        .catch(error => {
            console.log(error)
            res.status(error.status).json(error.body)
        })
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
        .catch(error => {
            console.log(error)
            res.status(500).json(error.body)
        })
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
        .catch(error => {
            console.log(error)
            res.status(500).json(error.body)
        })
}
