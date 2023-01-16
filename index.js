require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

class Note extends Model {}
Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'note',
  }
)
Note.sync()

app.use(bodyParser.json())

app.get('/api/notes', async (req, res) => {
  const notes = await Note.findAll()
  console.log(notes.map((note) => JSON.stringify(note, null, 2)))
  res.json(notes)
})

app.get('/api/notes/:id', async (req, res) => {
  const note = await Note.findByPk(req.params.id)
  if (note) {
    console.log(JSON.stringify(note, null, 2))
    res.json(note)
  } else {
    res.status(404).end()
  }
})

app.post('/api/notes', async (req, res) => {
  try {
    const note = await Note.create(req.body)
    return res.json(note)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

app.put('/api/notes/:id', async (req, res) => {
  const note = await Note.findByPk(req.params.id)
  if (note) {
    note.important = req.body.important
    await note.save()
    res.json(note)
  } else {
    res.status(404).end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
