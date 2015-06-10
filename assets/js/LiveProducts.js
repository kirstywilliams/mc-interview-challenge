var LiveProducts = 'uninitialized';
$(function() {
// Experiment with using RSS feed as an AJAX loaded products dictionary
LiveProducts = (function () {
  var DATA_PREFIX = "data-lp-";
  var FEED = "/data/category_13.xml";

  var LOAD_NAME_SELECTOR = DATA_PREFIX + "product-name",
      LOAD_ID_SELECTOR = DATA_PREFIX + "product-id",
      ATTR_BINDINGS = {
        "thumb": "src",
        "image": "src",
        "link": "href"
      },
      _mcp = {
        // Lazy-RSS Parse products as requested
        init: false,
        loadQueue: [],
        products: {},

        loadByName: function (productName) {
          if (this.init) {
            try {
              if (!this.products.hasOwnProperty(productName)
                  || this.products[productName].promise) {
                var $title = this.$productFeed.find("item>title:contains(" + productName + ")");
                this.cacheProduct(new Product($title.closest("item")));
              }
              return this.products[productName];
            } catch (e) {
              pageTracker._trackEvent("MissingData", productName);
              return false;
            }
          } else {
            this.loadQueue.push(productName);
            this.products[productName] = {
              promise : this.loadQueue.length
            };
            return this.products[productName];
          }
        },

        loadById: function (productId) {
          if (this.init) {
            try {
              if (!this.products.hasOwnProperty(productId)
                  || this.products[productId].promise) {
                var $id = this.$productFeed.find('*').filter(function () {
                  return this.tagName === "isc:productid" && $(this).text().replace(/\D+/g, '') == productId;
                });
                this.cacheProduct(new Product($id.closest('item')));
              }
              return this.products[productId];
            } catch (e) {
              pageTracker._trackEvent("MissingData", productId);
              return false;
            }
          } else {
            this.loadQueue.push('id'+ productId);
            this.products[productId] = {
              promise : this.loadQueue.length
            };
            return this.products[productId];
          }
        },

        cacheProduct: function (product) {
          if(this.products[product.id]){
            $.extend(this.products[product.id],product);
          } else {
            this.products[product.id] = product;
          }
          if(this.products[product.name]){
            $.extend(this.products[product.name],product);
          } else {
            this.products[product.name] = product;
          }
        },

        // Loops over product properties and push values into a template
        populateTemplate: function (product, $template) {
          if (!product) {
            return false;
          }
          var $field, staleData = false;
          for (var property in product) {
            if (product.hasOwnProperty(property)) {
              $field = $template.find("[" + DATA_PREFIX + property + "]");

              // If it's an attr binding set the product value into the appropriate attr
              if (ATTR_BINDINGS.hasOwnProperty(property)) {
                staleData = $field.attr(ATTR_BINDINGS[property]) != product[property];
                $field.attr(ATTR_BINDINGS[property], product[property]);
              }
              // Otherwise overwrite its contents with the product value
              else {
                staleData = $field.html() != product[property];
                $template.find("[" + DATA_PREFIX + property + "]").html(product[property]);
              }
              // Report updates to GA so we can clean them up and prevent inconsistencies flickering
              if (staleData && pageTracker) {
                pageTracker._trackEvent("StaleData", product, property);
              }
            }
          }
          $template.fadeIn();
          return true;
        },


        loaded: function () {
          var $productBindings = $("[" + LOAD_ID_SELECTOR + "]"),
              $productTemplate, product, i;

          // Switch to enable loading
          this.init = true;

          // Update the eager loads from the load queue
          for (i = 0; i < this.loadQueue.length; i ++){
            var loadQuery = this.loadQueue[i];
            if(loadQuery.indexOf('id') === 0){
              this.loadById(loadQuery.replace('id',''));
            } else {
              this.loadByName(loadQuery);
            }
          }

          // Load all product templates by ID
          for (i = 0; i < $productBindings.length; i++) {
            $productTemplate = $($productBindings[i]);
            product = this.loadById($productTemplate.attr(LOAD_ID_SELECTOR));
            this.populateTemplate(product, $productTemplate);
          }
          // Load all product templates by name
          $productBindings = $("[" + LOAD_NAME_SELECTOR + "]");
          for (i = 0; i < $productBindings.length; i++) {
            $productTemplate = $($productBindings[i]);
            product = this.loadByName($productTemplate.attr(LOAD_NAME_SELECTOR));
            this.populateTemplate(product, $productTemplate);
          }


          if(this.callback){
            this.callback();
          }

        },

        onLoad: function(callbackFn){
          if(this.init){
            callbackFn();
          } else {
            this.callback = callbackFn;
          }
        }

      };
  $.ajax({
    url: FEED,
    type: 'get'
    /*crossDomain: true*/
  }).done(function (data) {
        _mcp.$productFeed = $(data);
        _mcp.loaded();
      });

  return _mcp;

})();

});