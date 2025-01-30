const router = require("express").Router();
const complaintControllers = require("../controllers/admin/complaint.controller");

router
.route( "/create")
.post( complaintControllers.create_complain);

router
.route( "/retrieve")
.get( complaintControllers.get_complain);

router
.route( "/respond/:id")
.put( complaintControllers.admin_response);

module.exports = router;