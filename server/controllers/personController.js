const { Person, News, User, Category } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all people
// @route   GET /api/people
// @access  Public
const getPeople = async (req, res) => {
  try {
    const people = await Person.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(people);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single person
// @route   GET /api/people/:id
// @access  Public
const getPersonById = async (req, res) => {
  try {
    let person;
    const idOrSlug = req.params.id;
    
    // Check if the parameter is a number (ID) or string (slug)
    if (!isNaN(idOrSlug)) {
      // If it's a number, find by primary key
      person = await Person.findByPk(idOrSlug);
    } else {
      // If it's a string, find by slug
      person = await Person.findOne({
        where: { slug: idOrSlug }
      });
    }
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get news by person
// @route   GET /api/people/:id/news
// @access  Public
const getNewsByPerson = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    let person;
    const idOrSlug = req.params.id;
    
    // Check if the parameter is a number (ID) or string (slug)
    if (!isNaN(idOrSlug)) {
      // If it's a number, find by primary key
      person = await Person.findByPk(idOrSlug);
    } else {
      // If it's a string, find by slug
      person = await Person.findOne({
        where: { slug: idOrSlug }
      });
    }
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Get news associated with this person
    const news = await News.findAndCountAll({
      include: [
        {
          model: Person,
          where: { id: person.id }, // Use the found person's ID
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'profilePicture']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      where: { isPublished: true },
      order: [['publishedAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true // Important for correct count with associations
    });
    
    res.json({
      news: news.rows,
      page,
      pages: Math.ceil(news.count / pageSize),
      totalCount: news.count,
      person
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new person
// @route   POST /api/people
// @access  Private/Admin
const createPerson = async (req, res) => {
  try {
    const { name, description, profession } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Person name is required' });
    }
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if person already exists
    const personExists = await Person.findOne({ 
      where: { 
        [Op.or]: [
          { slug },
          { name }
        ]
      }
    });
    
    if (personExists) {
      return res.status(400).json({ message: 'A person with this name already exists' });
    }
    
    // Handle image upload
    let image = null;
    if (req.file) {
      image = `/uploads/people/${req.file.filename}`;
    }
    
    const person = await Person.create({
      name,
      description: description || '',
      profession: profession || '',
      slug,
      image
    });
    
    res.status(201).json(person);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update person
// @route   PUT /api/people/:id
// @access  Private/Admin
const updatePerson = async (req, res) => {
  try {
    const { name, description, profession } = req.body;
    
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Update fields
    if (name && name.trim() !== '') {
      const newSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if another person has this name or slug
      const personExists = await Person.findOne({ 
        where: { 
          [Op.or]: [
            { slug: newSlug },
            { name }
          ],
          id: { [Op.ne]: req.params.id } // Not the current person
        } 
      });
      
      if (personExists) {
        return res.status(400).json({ message: 'A person with this name already exists' });
      }
      
      person.name = name;
      person.slug = newSlug;
    }
    
    if (description !== undefined) {
      person.description = description;
    }
    
    if (profession !== undefined) {
      person.profession = profession;
    }
    
    // Update image if provided
    if (req.file) {
      person.image = `/uploads/people/${req.file.filename}`;
    }
    
    await person.save();
    
    res.json(person);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete person
// @route   DELETE /api/people/:id
// @access  Private/Admin
const deletePerson = async (req, res) => {
  try {
    const person = await Person.findByPk(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    await person.destroy();
    
    res.json({ message: 'Person removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPeople,
  getPersonById,
  getNewsByPerson,
  createPerson,
  updatePerson,
  deletePerson
};