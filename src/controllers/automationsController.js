const { deleteAutomation, getAutomation,
    getAutomations, insertAutomation,
    updateAutomation, getAutomationTypes
} = require('../repositories/automationsRepository')
const errorHandler = require('../utils/errorHandler')
const logger = require('../utils/logger')

exports.startAutomation = async (req, res) => {
    const id = req.params.id
    const automation = await getAutomation(id)
    if (!automation) return res.sendStatus(404)
    if (automation.isActive) return res.sendStatus(204)

    // update beholder brain

    automation.isActive = true
    await automation.save()

    res.json(automation)
    if (automation.logs) logger.info(`Automation ${automation.name} started`)
}

exports.stopAutomation = async (req, res) => {
    const id = req.params.id
    const automation = await getAutomation(id)
    if (!automation) return res.sendStatus(404)
    if (!automation.isActive) return res.sendStatus(204)

    // update beholder brain

    automation.isActive = false
    await automation.save()

    res.json(automation)
    if (automation.logs) logger.info(`Automation ${automation.name} stoped`)

}

exports.getAutomation = (req, res) => {
    const id = req.params.id
    getAutomation(id)
        .then(automation => res.json(automation))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.getAutomations = (req, res) => {
    const page = req.query.page
    getAutomations(page)
        .then(automations => res.json(automations))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.insertAutomation = (req, res) => {
    const newAutomation = req.body
    insertAutomation(newAutomation)
        .then(automation => {
            if (automation.isActive) {
                // update beholder brain
            }
            res.status(201).json(automation)
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.updateAutomation = async (req, res) => {
    const id = req.params.id
    const newAutomation = req.body

    updateAutomation(id, newAutomation)
        .then(automation => {
            if (automation.isActive) {
                // update beholder brain
            } else {
                // update beholder brain
            }
            res.json(automation)
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.deleteAutomation = async (req, res) => {
    const id = req.params.id

    const automation = await getAutomation(id)

    if (!automation) return res.sendStatus(404)
    if (automation.isActive) {
        // clean beholder brain
    }

    deleteAutomation(id)
        .then(_ => res.sendStatus(204))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
