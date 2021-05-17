const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    point: {
        type: mongoose.Schema.ObjectId,
        ref: 'Point'
    },
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: 'Patient'
    }
});

// Prevent user from submitting more than 1 review per point
ReviewSchema.index({
    point: 1,
    patient: 1
}, {
    unique: false
});

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (pointId) {
    const obj = await this.aggregate([{
            $match: {
                point: pointId
            }
        },
        {
            $group: {
                _id: '$point',
                averageRating: {
                    $avg: '$rating'
                }
            }
        }
    ]);

    try {
        await this.model('Point').findByIdAndUpdate(pointId, {
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.log(err);
    }
}

// Call getAverageCost after save
ReviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.point);
});

// Call getAverageCost before remove
ReviewSchema.pre('remove', async function () {
    await this.constructor.getAverageRating(this.point);
});


module.exports = mongoose.model('Review', ReviewSchema);