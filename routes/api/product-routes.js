const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint
// find all products
// be sure to include its associated Category and Tag data
router.get("/", (req, res) => {
  Product.findAll({
    attributes: ["id", "product_name", "price", "stock"],
    include: [
      {
        model: Category,
        attributes: ["id", "category_name"],
      },
      {
        model: Tag,
        as: "product_tags",
        attributes: ["id", "tag_name"],
      },
    ],
  })
    .then((Data) => {
      if (!Data) {
        res
          .status(404)
          .json({ message: "No data found. Please seed the databse first." });
        return;
      }
      res.json(Data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// find a single product by its `id`
// be sure to include its associated Category and Tag data
router.get("/:id", (req, res) => {
  Product.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "product_name", "price", "stock"],
    include: [
      {
        model: Category,
        attributes: ["id", "category_name"],
      },
      {
        model: Tag,
        as: "product_tags",
        attributes: ["id", "tag_name"],
      },
    ],
  })
    .then((Data) => {
      if (!Data) {
        res
          .status(404)
          .json({ message: "No matching product found for this ID." });
        return;
      }
      res.json(Data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const pTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(pTagIdArr);
      }

      res.status(200).json(product);
    })
    .then((pTagIds) => res.status(200).json(pTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product data by its `id` value
router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      const pTagIds = productTags.map(({ tag_id }) => tag_id);

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !pTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value
router.delete("/:id", (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((Data) => {
      if (!Data) {
        res.status(404).json({
          message: "Delete failed. No matching product found for this ID.",
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
