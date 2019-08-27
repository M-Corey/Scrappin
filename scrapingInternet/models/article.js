var mongoose = require("mongoose");
var schema = mongoose.schema;
var articleSchema = new schema({
    title: {
        type: String,
        require: true
    },
    link: {
        type: String,
        require: true
    },
    note: {
        type: schema.types.objectId,
        ref: "note"
    }
});
var article = mongoose.model("article", articleSchema);

module.exports = article;