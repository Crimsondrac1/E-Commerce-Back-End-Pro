const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint
// find all tags
// be sure to include its associated Product data
router.get("/", (req, res) => {
  Tag.findAll({
    attributes: ["id", "tag_name"],
    include: [
      {
        model: Product,
        as: "product_tags",
        attributes: ["id", "product_name", "price", "stock"],
      },
    ],
  })
    .then((Data) => res.json(Data))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// find a single tag by its `id`
// be sure to include its associated Product data
router.get("/:id", (req, res) => {
  Tag.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "tag_name"],
    include: [
      {
        model: Product,
        as: "product_tags",
        attributes: ["id", "product_name", "price", "stock"],
      },
    ],
  })
    .then((Data) => {
      if (!Data) {
        res.status(404).json({ message: "No matching tag found for this ID." });
        return;
      }
      res.json(Data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create a new tag
router.post("/", (req, res) => {
  Tag.create({
    tag_name: req.body.tag_name,
  })
    .then((Data) => res.json(Data))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// update a tag's name by its `id` value
router.put("/:id", (req, res) => {
  Tag.update(
    {
      tag_name: req.body.tag_name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((Data) => {
      if (!Data) {
        res.status(404).json({
          message: "Update failed. No matching tag found for this ID.",
        });
        return;
      }
      res.json(Data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// delete on tag by its `id` value
router.delete("/:id", (req, res) => {
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((Data) => {
      if (!Data) {
        res.status(404).json({
          message: "Delete failed. No matching tag found for this ID.",
        });
        return;
      }
      res.json(Data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Catch all bad/invalid routes.
router.get("*", function (req, res) {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
