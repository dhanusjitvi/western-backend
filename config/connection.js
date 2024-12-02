const mongoose = require('mongoose');
mongoose.set('strictQuery',false)



const db = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGOURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("mongo db databce conncted");
    } catch (err) {

        console.log(err);
        process.exit(1);

    }
}

module.exports = db 