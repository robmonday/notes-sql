// const jwt = require('jsonwebtoken')
// const { SECRET } = require('../util/config')
// const { sequelize } = require('../util/db')

const router = require('express').Router()

const { Note, User } = require('../models')

const { Op } = require('sequelize')

const { tokenExtractor } = require('../util/middleware')

const noteFinder = async (req, res, next) => {
  try {
    req.note = await Note.findByPk(req.params.id)
  } catch (err) {
    next(err)
  }
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.important) {
    where.important = req.query.important === 'true'
  }

  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search,
    }
  }

  const notes = await Note.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
  })
  console.log(notes.map((note) => JSON.stringify(note, null, 2)))
  res.json(notes)
})

router.get('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    console.log(JSON.stringify(req.note, null, 2))
    res.json(req.note)
  } else {
    res.status(404).end()
  }
})

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const note = await Note.create({
      ...req.body,
      userId: user.id,
      date: new Date(),
    })
    res.json(note)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

router.delete('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    await req.note.destroy()
  }
  res.status(204).end()
})

router.put('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    req.note.important = req.body.important
    await req.note.save()
    res.json(req.note)
  } else {
    res.status(404).end()
  }
})

module.exports = router
