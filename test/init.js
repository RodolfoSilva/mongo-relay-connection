import File from './models/file'
import Person from './models/person'
import Product from './models/product'
import Starship from './models/starship'
import Story from './models/story'
import fileData from './data/files.json'
import mongoose from 'mongoose'
import productData from './data/products.json'
import starshipData from './data/starships.json'

mongoose.Promise = global.Promise

function clearDB () {
  return Promise.all([
    Starship.remove(),
    Product.remove(),
    File.remove(),
    Story.remove(),
    Person.remove()
  ])
}

function populateStarship () {
  const { data: { allStarships: { edges } } } = starshipData
  return Promise.all(edges.map(({ node }) => {
    const ship = new Starship(node)
    return ship.save()
  }))
}

function populateProduct () {
  return Promise.all(productData.map(p => {
    const product = new Product(p)
    return product.save()
  }))
}

function populateFile () {
  return Promise.all(fileData.map(f => {
    const file = new File(f)
    return file.save()
  }))
}

async function populateStory () {
  const p1 = new Person({ name: 'Richard Feynman', age: 69 })
  const p2 = new Person({ name: 'Nikola Tesla', age: 86 })
  const s1 = new Story({ title: 'Feynman Diagram', author: p1._id })
  const s2 = new Story({ title: 'Tesla Coil', author: p2._id })
  await Promise.all([
    p1.save(),
    p2.save(),
    s1.save()
  ])
  await s2.save() // so that s2 is saved after s1
}

function populateData () {
  return Promise.all([
    populateStarship(),
    populateProduct(),
    populateFile(),
    populateStory()
  ])
}

// executed only once
before(done => {
  mongoose.connect('mongodb://localhost:27017/mongo-relay-connection-test', { useNewUrlParser: true })
  mongoose.connection
    .once('open', async () => {
      // console.log('Connected to mongo')
      await clearDB()
      await populateData()
      // console.log('Populated data')
      done()
    })
    .on('error', error => {
      console.warn('Warning', error)
    })
})

after(() => {
  mongoose.connection.close()
})
