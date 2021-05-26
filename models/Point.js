const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const PointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    phone: {
        type: String,
        maxlength: [15, 'Phone number cannot be longer than 15 numbers']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: Number,
        country: String
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'Patient'
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Create bootcamp slug from the name
PointSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// Geocode & create location field
PointSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };

    // Do not save address in DB
    this.address = undefined;
    next();
});

// Cascade delete plasmas when a point is deleted
PointSchema.pre('remove', async function (next) {
    console.log(`Plasmas being removed from donation point ${this._id}`);
    await this.model('Plasma').deleteMany({
        point: this._id
    });
    next();
})

// Reverse populate with virtuals
PointSchema.virtual('plasmas', {
    ref: 'Plasma',
    localField: '_id',
    foreignField: 'point',
    justOne: false

})

module.exports = mongoose.model('Point', PointSchema);