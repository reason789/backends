class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const search = this.queryStr.search
      ? {
          name: {
            $regex: this.queryStr.search,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...search }); // If we do not use ...search, it wont care anout condition. It will work like Product.find()
    //console.log(search); // { name: { '$regex': 'ha', '$options': 'i' } }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["search", "cap", "startDate", "endDate"];
    removeFields.forEach((key) => delete queryCopy[key]);

    for (let key in queryCopy) {
      if (typeof queryCopy[key] === "string" && queryCopy[key].includes(",")) {
        const values = queryCopy[key].split(",");
        queryCopy[key] = { $in: values };
      }
    }

    // Add a check to see if any property is empty and remove it from the queryCopy
    for (let key in queryCopy) {
      if (!queryCopy[key]) {
        delete queryCopy[key];
      }
    }

    let queryStr = JSON.stringify(queryCopy);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
}

module.exports = ApiFeatures;
