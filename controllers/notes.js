const router = require('express').Router()

const { Note } = require('../models')

const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const notes = await Note.findAll()
  console.log(notes.map((note) => JSON.stringify(note, null, 2)))
  res.json(notes)
})

router.get('/:id', noteFinder, async (req, res) => {
  const note = await Note.findByPk(req.params.id)
  if (req.note) {
    console.log(JSON.stringify(req.note, null, 2))
    res.json(req.note)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res) => {
  try {
    const note = await Note.create(req.body)
    return res.json(note)
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
