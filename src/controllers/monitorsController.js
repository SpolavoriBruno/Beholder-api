const { deleteMonitor, getActiveMonitor, getMonitor, getMonitors, insertMonitor, monitorTypes, updateMonitor, } = require('../repositories/monitorsRepository')


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

    // startMonitor(id)

    monitor.isActive = true
    await monitor.save()
    res.json(monitor)
}

exports.stopMonitor = async (req, res, next) => {
    const id = req.params.id
    const monitor = await getMonitor(id)
    if (!monitor.isActive) return res.sendStatus(204)
    if (monitor.isSystemMon) return res.sendStatus(403)

    // stopMonitor(id)

    monitor.isActive = false
    await monitor.save()
    res.json(monitor.get({ plain: true }))
}

exports.insertMonitor = (req, res, next) => {
    const newMonitor = req.body
    insertMonitor(newMonitor)
        .then(monitor => {
            if (monitor.isActive) {
                // startMonitor(monitor.id)
            }
            res.json(monitor.get({ plain: true }))
        })
        .catch(next)
}

exports.updateMonitor = async (req, res, next) => {
    const id = req.params.id
    const newMonitor = req.body

    const currentMonitor = await getMonitor(id)
    if (currentMonitor.isSystemMon) return res.sendStatus(403)


    updateMonitor(id, newMonitor)
        .then(monitor => {
            if (monitor.isActive) {
                // stopMonitor(monitor.id)
                // startMonitor(monitor.id)
            } else {
                // stopMonitor(monitor.id)
            }
            res.json(monitor.get({ plain: true }))
        })
        .catch(next)
}

exports.deleteMonitor = async (req, res, next) => {
    const id = req.params.id

    const currentMonitor = await getMonitor(id)
    if (currentMonitor.isSystemMon) return res.sendStatus(403)

    if (currentMonitor.isActive) {
        // stopMonitor(id)
    }

    deleteMonitor(id)
        .then(monitor => res.sendStatus(204))
        .catch(next)
}
