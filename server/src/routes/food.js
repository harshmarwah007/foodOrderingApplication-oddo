/** @format */

const express = require("express");
const router = express.Router();
const {
  getFoodDishes,
  putFoodDishes,
} = require("../controller/foodDishesController");
const { getRecommendations } = require("../controller/foodRecommendController");
const getHistory = require("../controller/historyControllers");
const passport = require("passport");
var redisMiddle = require("../controller/redisMiddleware");
//Passport config
require("../config/passport");
const getAllMetrics = require("../controller/metricsController");
const {
  updateBulkOrder,
  getOrders,
  saveOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  getDineInOrders,
} = require("../controller/ordersControllers");
// Food Orders Routes
router.get(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  getAllOrders
);
router.post(
  "/order",
  passport.authenticate("jwt", { session: false }),
  saveOrder
);
router.get(
  "/order/:pageNo",
  passport.authenticate("jwt", { session: false }),
  getOrders
);
router.patch(
  "/orderStatus/:orderId",
  passport.authenticate("jwt", { session: false }),
  updateOrderStatus
);
router.patch(
  "/bulkOrders",
  passport.authenticate("jwt", { session: false }),
  updateBulkOrder
);
router.patch(
  "/order/:orderId",
  passport.authenticate("jwt", { session: false }),
  updateOrder
);
router.get(
  "/history/:pageNo",
  passport.authenticate("jwt", { session: false }),
  getHistory
);
router.get(
  "/dineInOrders",
  passport.authenticate("jwt", { session: false }),
  getDineInOrders
);

//Food Dishes Routers

var redis = require("redis");
var client = redis.createClient();
client.connect();
// router.get("/dishes", redisMiddle("foodDishesData"), getFoodDishes);
router.get("/dishes", getFoodDishes);
router.post("/dishes", putFoodDishes);
// router.get("/recommendations/:cart", getRecommendations);
router.get("/recommendations", getRecommendations);

//Metrics route
router.get(
  "/metrics",
  passport.authenticate("jwt", { session: false }),
  getAllMetrics
);

module.exports = router;
