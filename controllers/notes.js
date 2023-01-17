const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { Note, User } = require('../models')
const { SECRET } = require('../util/config')

const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id)
  next()
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      console.log('decodedToken', req.decodedToken)
    } catch {
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.get('/', async (req, res) => {
  const notes = await Note.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name'],
    },
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
