const commentController = require("../../controllers/seller/dasboard/commentController");
const router = require("express").Router();

router
.route("/create-comment/:productId")
.post(commentController.createComment);

router
.route("/:productId")
.get(commentController.getAllComments);

router
.route("/:commentId/hide-comment")
.patch(commentController.hideComment);

router
.route("/update-comment/:commentId")
.put(commentController.updateComment);

router
.route("/reply-comment/:commentId")
.post(commentController.replyToComment);


router
.route("/delete-comment/:commentId")
.delete(commentController.deleteComment);


module.exports = router;