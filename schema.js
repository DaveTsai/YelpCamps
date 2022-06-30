const Joi = require("joi")

module.exports.campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().positive(),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
});

module.exports.reviewSchema = Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5)
})