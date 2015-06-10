/*
   Product Object prototype
   - constructor for BC product from RSS
   - surface metadata as primitives
   */
  var Product = function ($product) {
    // Helper to parse RSS $product
    function _getCData(tagName) {
      var $attr = $product.find('*').filter(function () {
        return this.tagName === tagName;
      });
      return $.trim($attr.text().replace('<![CDATA[', '').replace("]]>", ''));
    }

    return {
      id: _getCData("isc:productid"),
      name: _getCData("title"),
      thumb: _getCData("isc:thumb"),
      image: _getCData("isc:image"),
      price: _getCData("isc:price"),
      link: _getCData("link")
    }
  };