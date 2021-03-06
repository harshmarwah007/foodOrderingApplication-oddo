/** @format */

const foodOrders = require("../models/FoodOrders");
const foodDishes = require("../models/FoodDishes");
const async = require("async");
const getAllMetrics = async (req, res) => {
  var allMetrics = function (done) {
    foodOrders
      .aggregate([
        {
          $match: { orderStatus: "Completed", userId: req.user._id },
        },
        {
          $facet: {
            topSelling: [
              {
                $match: {
                  "dishList.tag": { $nin: ["alcohol", "nonAlcohol"] },
                },
              },
              { $unwind: "$dishList" },
              {
                $group: {
                  _id: "$dishList.name",
                  qty: { $sum: "$dishList.qty" },
                },
              },
              { $sort: { qty: -1, _id: 1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  metricsType: "Top Selling - Food Dish",
                  value: "$_id",
                  qty: 1,
                },
              },
            ],
            leastSelling: [
              {
                $match: {
                  "dishList.tag": { $nin: ["alcohol", "nonAlcohol"] },
                },
              },
              { $unwind: "$dishList" },
              {
                $group: {
                  _id: "$dishList.name",
                  qty: { $sum: "$dishList.qty" },
                },
              },
              { $sort: { qty: 1, _id: 1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  metricsType: "Least Selling - Food Dish",
                  value: "$_id",
                  qty: 1,
                },
              },
            ],
            numberOfCustomers: [
              { $group: { _id: "$customerName", count: { $sum: 1 } } },
              { $count: "numberOfCustomers" },
              {
                $project: {
                  metricsType: "Total Number Of Customers",
                  value: "$numberOfCustomers",
                },
              },
            ],
            mostVisitingCustomer: [
              { $group: { _id: "$customerName", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 0,
                  metricsType: "Most Visiting Customer",
                  details: "(Highest number of visits)",
                  value: "$_id",
                  count: 1,
                },
              },
            ],

            topCustomer: [
              {
                $group: {
                  _id: "$customerName",
                  count: { $sum: 1 },
                  orderSum: { $sum: "$orderAmount" },
                },
              },
              { $sort: { orderSum: -1, count: -1 } },
              {
                $match: { count: { $gt: 1 } },
              },
              { $limit: 1 },
              {
                $project: {
                  metricsType: "Top Customer",
                  details: "(Highest total order amount and number of visits)",
                  value: "$_id",
                  _id: 0,
                  orderSum: 1,
                },
              },
            ],
            happyDayOfThisMonth: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $dateToString: { format: "%m", date: "$date" } },
                      { $dateToString: { format: "%m", date: new Date() } },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  revenue: { $sum: "$orderAmount" },
                },
              },
              {
                $sort: {
                  revenue: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  metricsType: "Happy day of Current Month",
                  details: "(Highest Sale Day of Month)",
                  value: "$_id",
                  _id: 0,
                  revenue: 1,
                },
              },
            ],
            badDayOfThisMonth: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $dateToString: { format: "%m", date: "$date" } },
                      { $dateToString: { format: "%m", date: new Date() } },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  revenue: { $sum: "$orderAmount" },
                },
              },
              {
                $sort: {
                  revenue: 1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  metricsType: "Bad day of Current Month",
                  details: "(Lowest Sale Day of Month)",
                  value: "$_id",
                  _id: 0,
                  revenue: 1,
                },
              },
            ],
            customersVisitedOnlyOnce: [
              {
                $group: {
                  _id: {
                    customerName: "$customerName",
                  },
                  count: { $sum: 1 },
                  customerDetails: {
                    $push: {
                      customerName: "$customerName",
                      customerContact: "$customerContact",
                    },
                  },
                },
              },
              { $match: { count: 1 } },
              {
                $project: {
                  metricsType: "customersVisitedOnlyOnce",
                  customerDetails: 1,
                  _id: 0,
                },
              },
            ],
            totalDineInOrders: [
              {
                $match: { orderType: "dineIn" },
              },
              { $count: "totalDineInOrders" },
              {
                $project: {
                  metricsType: "Total DineIn Orders",
                  value: "$totalDineInOrders",
                },
              },
            ],
            totalTakeAwayOrders: [
              {
                $match: { orderType: "takeAway" },
              },
              { $count: "totalTakeAwayOrders" },
              {
                $project: {
                  metricsType: "Total TakeAway Orders",
                  value: "$totalTakeAwayOrders",
                },
              },
            ],
          },
        },
      ])
      .then(function (result) {
        done(null, result);
      });
  };
  var salesMetrics = function (done) {
    foodOrders
      .aggregate([
        {
          $match: { orderStatus: "Completed", userId: req.user._id },
        },
        {
          $facet: {
            saleOfThisMonth: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $dateToString: { format: "%m", date: "$date" } },
                      { $dateToString: { format: "%m", date: new Date() } },
                    ],
                  },
                },
              },

              {
                $group: { _id: null, total: { $sum: "$orderAmount" } },
              },
              {
                $project: {
                  _id: 0,
                  metricsType: "Total Sale of This Month",
                  value: "$total",
                },
              },
            ],
            totalSale: [
              {
                $group: { _id: null, total: { $sum: "$orderAmount" } },
              },
              {
                $project: {
                  _id: 0,
                  metricsType: "Total Sale",
                  details: "(Overall sale from beginning)",
                  value: "$total",
                },
              },
            ],
          },
        },
      ])
      .then(function (result) {
        done(null, result);
      });
  };
  var tagsAndDishes = function (done) {
    foodDishes
      .aggregate([
        {
          $group: {
            _id: "$tag",
            dishes: { $push: "$name" },
          },
        },
      ])
      .then(function (result) {
        done(null, result);
      });
  };
  var taxes = function (done) {
    foodOrders
      .aggregate([
        {
          $match: { orderStatus: "Completed", userId: req.user._id },
        },
        { $unwind: "$dishList" },
        {
          $facet: {
            taxEarnedOnDishes: [
              { $unwind: "$dishList.tax" },
              {
                $group: {
                  _id: {
                    dish: "$dishList.name",
                    taxType: "$dishList.tax.name",
                  },
                  taxValue: { $sum: "$dishList.tax.taxAmount" },
                },
              },
              {
                $group: {
                  _id: "$_id.dish",
                  taxes: {
                    $push: {
                      taxName: "$_id.taxType",
                      taxValue: "$taxValue",
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  dishName: "$_id",
                  taxes: "$taxes",
                },
              },
            ],
            taxesEarnedThisMonth: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $dateToString: { format: "%m", date: "$date" } },
                      { $dateToString: { format: "%m", date: new Date() } },
                    ],
                  },
                },
              },
              { $unwind: "$tax.taxes" },
              {
                $group: {
                  _id: "$tax.taxes.name",
                  totalTaxValue: { $sum: "$tax.taxes.taxValue" },
                  count: { $count: {} },
                },
              },
              {
                $project: {
                  _id: 0,
                  taxType: "$_id",
                  totalTaxValue: 1,
                  count: 1,
                },
              },
            ],
          },
        },
      ])
      .then(function (result) {
        done(null, result);
      });
  };
  async.series(
    {
      allMetrics,
      salesMetrics,
      taxes,
      tagsAndDishes,
    },
    function (err, result) {
      if (err) {
        console.log(err);
      }
      res.json(result);
    }
  );
  // var test = await foodOrders.aggregate([
  //   {
  //     $match: { orderType: "dineIn" },
  //   },
  //   { $count: "totalDineInOrders" },
  //   {
  //     $project: {
  //       metricsType: "Total DineIn Orders",
  //       value: "$totalDineInOrders",
  //     },
  //   },
  // ]);
  //  res.json(test);
};

module.exports = getAllMetrics;
