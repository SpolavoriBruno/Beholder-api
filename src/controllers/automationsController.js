const { deleteAutomation, getAutomation,
    getAutomations, insertAutomation,
    updateAutomation, automationExists
} = require('../repositories/automationsRepository')
const { updateBrain, deleteBrain } = require('../beholder')
const db = require('../db')
const errorHandler = require('../utils/errorHandler')
const logger = require('../utils/logger')
const { insertActions, deleteActions } = require('../repositories/actionsRepository')

const validateConditions = conditions =>
    /^(MEMORY\[\'[a-z0-9:_\-]+?\'\]([\.a-z]+)?[><=!]+([0-9\.\-]+?|true|false|(\'[a-z:_]+?\')|MEMORY\[\'[a-z0-9:_\-]+?\'\]([\.a-z]+)?)( && )?)+$/i.test(conditions)

exports.startAutomation = async (req, res) => {
    const id = req.params.id
    const automation = await getAutomation(id)
    if (!automation) return res.sendStatus(404)
    if (automation.isActive) return res.sendStatus(204)

    automation.isActive = true
    await automation.save()

    res.json(automation)
    updateBrain(automation.get({ plain: true }))
    if (automation.logs) logger.info(`Automation ${automation.name} started`)
}

exports.stopAutomation = async (req, res) => {
    const id = req.params.id
    const automation = await getAutomation(id)
    if (!automation) return res.sendStatus(404)
    if (!automation.isActive) return res.sendStatus(204)

    automation.isActive = false
    await automation.save()

    res.json(automation)
    deleteBrain(automation.get({ plain: true }))
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

exports.insertAutomation = async (req, res) => {
    const newAutomation = req.body

    if (!validateConditions(newAutomation.conditions))
        return res.status(400).json(`Invalid conditions`)

    if (!newAutomation.actions || !newAutomation.actions.length)
        return res.status(400).json(`Invalid actions`)

    const exists = await automationExists(newAutomation.name);
    if (exists) return res.status(409).json(`The automation ${newAutomation.name} already exists!`);

    const transaction = await db.transaction()

    insertAutomation(newAutomation, transaction)
        .then(async automation => {
            let actions
            try {
                actions = newAutomation.actions.map(action => {
                    action.automationId = automation.id
                    return action
                })

                await insertActions(actions, transaction)
            } catch (error) {
                transaction.rollback()
                console.error(error)
                return res.status(500).json("Error updating actions")
            }

            automation = automation.get({ plain: true })

            if (automation.isActive) {
                updateBrain(automation)
            }
            transaction.commit()
            res.status(201).json(automation)
        })
        .catch(e => {
            errorHandler(e, (s, b) => res.status(s).json(b), { on: "Insert automation" })
            transaction.rollback()
        })
}

exports.updateAutomation = async (req, res) => {
    const id = req.params.id
    const newAutomation = req.body
    if (!validateConditions(newAutomation.conditions))
        return res.status(400).json('You need to have at least one condition per automation!');

    if (!newAutomation.actions || !newAutomation.actions.length)
        return res.status(400).json('You need to have at least one action per automation!');

    const actions = newAutomation.actions.map(action => {
        action.automationId = id
        delete action.id
        return action
    })

    const transaction = await db.transaction()

    updateAutomation(id, newAutomation)
        .then(async automation => {
            try {
                await deleteActions(id, transaction)
                await insertActions(actions, transaction)
            } catch (error) {
                transaction.rollback()
                return res.status(500).json("Error updating actions")
            }

            if (automation.isActive) {
                deleteBrain(automation.get({ plain: true }))
                updateBrain(automation.get({ plain: true }))
            } else {
                deleteBrain(automation.get({ plain: true }))
            }
            res.json(automation)
            transaction.commit()
        })
        .catch(e => {
            transaction.rollback()
            return errorHandler(e, (s, b) => res.status(s).json(b))
        })
}

exports.deleteAutomation = async (req, res) => {
    const id = req.params.id

    const automation = await getAutomation(id)

    if (!automation) return res.sendStatus(404)
    if (automation.isActive)
        deleteBrain(automation.get({ plain: true }))

    deleteAutomation(id)
        .then(_ => res.sendStatus(204))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
