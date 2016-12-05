/* eslint no-undef: [0]*/
module.exports = {
  title: "mBecommerce",
  style: "m-becommerce.less",
  template: 'm-becommerce.html',
  i18n: {
    pt: "lang/pt-BR.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $rootScope,
    $mAppDef,
    $mDataLoader,
    $mPlatform,
    $mTheme,
    $mAlert,
    $mContextualActions,
    $filter,
    $interval,
    $timeout,
    $ionicScrollDelegate,
    $state,
    $stateParams,
    $http,
    $q
  ) {
    window.malbumImageLoaded = function(element) {
      element.parentElement.classList.add("loaded");
    };
    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ENUMS AND GLOBAL VARS * ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    // Pages ENUM
    var page = {
      STORE: 'store',
      CATEGORY: 'category',
      CATEGORY_PRODUCTS: 'categoryProducts',
      PRODUCT: 'product',
      CART: 'cart'
    };

    // End points ENUM
    var endPoint = {
      STORE: 'common/conf/store/',
      // banner: 'app_banner/list/section/',
      BANNER: 'slider/list/section/',
      CART: 'cart/',
      SECTIONS: 'section/',
      _CATEGORY: function(categoryId, page, items) {
        return 'product/list/category/' + categoryId +
         '?page=' + page + '&itemsPerPage=' + items;
      },
      _DETAIL: function(productId) {
        return 'product/detail/' + productId;
      },
      _SIMILAR: function(productId) {
        return 'product/list/similar/' +
          productId;
      },
      _SHIPPING: function(zipCode, productId) {
        return 'cart/shipping-list/' +
          zipCode + '/' + productId + '/1';
      }
    };

    // Store page ENUM
    var storePage = {
      HOME: 'home',
      CATEGORIES: 'categories',
      SEARCH: 'search'
    };

    // Limit for the number of products shown initialy (allways in pairs)
    var groupLimit = 2 * 2;

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** HELPERS  ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var helpers = {
      /**
       * Display the 'no content' view
       * @param  {String} err The error
       */
      error: function(err) {
        $scope.isLoading = false;
        $scope.error = true;
        $scope.noContent = true;
        console.error(err);
      },
      /**
       * Localize the numbers into Brazilian currency strings
       * @param  {Number} value The numeric value to be converted
       * @return {String}       The number with R$ and Brazilian thousands and
       *                        decimal separators
       */
      localizeCurrency: function(value) {
        var corrected = $filter('currency')(value, "R$", 2);
        var splited = corrected.split('.');
        var localized = splited[0].replace(',', '.') + ',' + splited[1];
        return localized;
      },
      /**
       * Put the theme colors in the $scope
       */
      setColors: function() {
        var colors = $mAppDef().load().colors;
        colors.darker = $mTheme.shadeColor(colors.header_color, -0.2);
        colors.lighter = $mTheme.shadeColor(colors.header_color, 0.2);
        $scope.colors = colors;
      },
      /**
       * Create the cart contextual action (icon in header)
       */
      setCartContextualAction: function() {
        var icons = ["ion-ios-cart", "ion-android-cart"];
        $mContextualActions.add(
          $scope.page.page_id,
          "cart",
          icons,
          "contextual",
          function() {
            $mAlert.shows(
              "It's gonna be",
              'L E G E N D A R Y',
              'OK'
            );
          }
        );
      },
      /**
       * Scroll to an HTML specific id
       * @param  {String} id The html id
       */
      scrollToId: function(id) {
        var top = document.getElementById(id).offsetTop;
        $ionicScrollDelegate.scrollTo(0, top, true);
      },
      /**
       * Localize a list of products to Brazilian currency and number
       * @param {Array} products The list of products to be localized and the
       *                         promotion set to true or false
       */
      setProductsPriceAndPromotion: function(products) {
        var createNumericValue = function(val) {
          if (typeof val === 'string') {
            val = val.replace("R$", '');
            val = val.replace('.', '');
            val = val.replace(',', '.');
            val = Number(val);
          }
          return val;
        };

        for (var i = 0; i < products.length; i++) {
          products[i].valueFrom = createNumericValue(products[i].valueFrom);
          products[i].valueTo = createNumericValue(products[i].valueTo);

          if (products[i].valueFrom &&
            products[i].valueFrom > products[i].valueTo) {
            products[i].valueFrom = helpers.localizeCurrency(
              products[i].valueFrom);
            products[i].hasPromotion = true;
          } else {
            products[i].hasPromotion = false;
          }
          products[i].valueTo = helpers.localizeCurrency(
            products[i].valueTo);
        }
      },
      /**
       * Change a section's ng-repeat limit to show all products
       * @param  {Object} productGroup The $scope product group with it's
       *                               products
       * @param  {String} groupId      The html id of the product group used to
       *                               scroll to the first product
       */
      productGroupLimitSwap: function(productGroup, groupId) {
        if (productGroup.hasMoreProducts === true) {
          productGroup.hasMoreProducts = false;
          productGroup.limit = productGroup.products.length;
        } else {
          productGroup.hasMoreProducts = true;
          productGroup.limit = groupLimit;
        }
        // Resize scroll
        $ionicScrollDelegate.resize();
        // Scroll to position
        helpers.scrollToId(groupId + '-product-0');
      },
      /**
       * Create a product group object
       * @param  {String} name     The name of the group
       * @param  {Array} products  The list of products
       * @example The product group object has the following structure
       * {
       *  name: {String}             The group name
       *  limit: {Number}            The number of products that will be shown
       *                             in the list
       *  hasProducts: {Boolean}     True is the list has 1 or more products
       *  hasMoreProducts: {Boolean} Based on the limit and the total number of
       *                             products
       *  showSwapButton: {Boolean}  True if the list has more products than
       *                             the original limit
       *  products: {Array}          The list of products in the group
       * }
       * @return {Object}          The product group
       */
      createProductGroup: function(name, products) {
        helpers.setProductsPriceAndPromotion(products);

        var productGroup = {
          name: name,
          limit: products.length < groupLimit ? products.length : groupLimit,
          hasProducts: products.length > 0,
          hasMoreProducts: products.length > groupLimit,
          showSwapButton: products.length > groupLimit,
          products: products
        };
        return productGroup;
      },
      /**
       * DEBUG ONLY - Clear the Browser log
       */
      clearLog: function() {
        // // CLEAR CONSOLE
        if (typeof console._commandLineAPI !== 'undefined') {
          console.API = console._commandLineAPI; // chrome
        } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
          console.API = console._inspectorCommandLineAPI; // Safari
        } else if (typeof console.clear !== 'undefined') {
          console.API = console;
        }

        console.API.clear();
      },
      /**
       * Open or close the accordion
       * @param  {String} accordionToggleName The $scope's accordion
       */
      accordionSwap: function(accordionToggleName) {
        $scope[accordionToggleName] = !$scope[accordionToggleName];

        // Wait for the animation to finish
        $timeout(function() {
          $ionicScrollDelegate.resize();
        }, 350);
      },
      /**
       * Get the themes colors and create the style to be injected on the page
       */
      injectStyle: function() {
        if ($scope.colors === undefined) {
          helpers.setColors();
        }
        $scope.pageStyle = '.android .menu .selected {' +
          'border-bottom-color: ' + $scope.colors.darker + '!important;' +
          '}';
      }
    };

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** APP MODEL * ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var appModel = {
      /**
       * Load the app def and sets each store api in the $scope.instanceData
       * @return {Promise} Resolve after the app def is loaded and all instance is saved
       */
      loadInstanceData: function() {
        var deferred = $q.defer();
        var dataLoadOptions = {
          cache: ($stateParams.detail !== "")
        };

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            $scope.apiUrl = data.apiUrl;
            deferred.resolve();
          })
          .catch(function(err) {
            helpers.error(err);
            deferred.reject(err);
          });
        return deferred.promise;
      },
      /**
       * [getData description]
       * @param  {String} endpoint String (use it from the object endPoint)
       * @return {Promise}     The API response after loaded
       */
      getData: function(endpoint) {
        var deferred = $q.defer();
        $http.get($scope.apiUrl + endpoint)
          .then(
            function(response) {
              deferred.resolve(response);
            },
            function(err) {
              helpers.error(err);
              deferred.reject(err);
            }
        );
        return deferred.promise;
      }
    };

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** NAVIAGTION CONTROLLER * ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    navigationController = {
      /**
       * Go to a product's page
       * @param  {String} productId The product ID
       */
      goToProduct: function(productId) {
        $stateParams.detail = page.PRODUCT + '&' + productId;
        $state.go('pages', $stateParams);
      },

      /**
       * Go to a category's page
       * @param  {Object} category The category
       */
      goToCategory: function(category) {
        if (category.hasSubCategories) {
          $stateParams.detail = page.CATEGORY + '&' + category.id;
        } else {
          $stateParams.detail = page.CATEGORY_PRODUCTS + '&' + category.id;
        }
        $rootScope.category = category;
        $state.go('pages', $stateParams);
      },

      /**
       * Go to a page inside the store view
       * @param {String} page The store page to show
       */
      goToStorePage: function(page) {
        for (var cPage in storePage) {
          if (storePage.hasOwnProperty(cPage)) {
            $scope.storePage[storePage[cPage]] = page === storePage[cPage];
          }
        }
        $ionicScrollDelegate.resize();
      }
    };

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** STORE CONTROLLER  ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var storeController = {
      /**
       * Change the banners ng-repeat limit to show all banners
       */
      bannersLimitSwap: function() {
        // First, change the list size
        $scope.banners.limit = $scope.banners.showMoreButton ?
          $scope.banners.products.length :
          1;
        $scope.banners.showMoreButton = !$scope.banners.showMoreButton;
        // Resize scroll
        $ionicScrollDelegate.resize();
        // Scroll to position
        helpers.scrollToId('banner-container');
      },

      organizeCategories(categoriesData, first) {
        var fillCategories = function fillCategories(data) {
          var categories = [];
          // Fill each category with the relecant data
          data.forEach(cat => {
            var category = {
              name: cat.name,
              // Check if there is only one subcategory with the same items that
              // the parent and link to it directly
              id: (cat.headerCategorySubJsons !== null &&
                  cat.headerCategorySubJsons.length === 1 &&
                  cat.headerCategorySubJsons[0]
                    .productCount === cat.productCount) ?
                  cat.headerCategorySubJsons[0].id :
                  cat.id,
              productsPage: false,
              productCount: cat.productCount,
              // Check if there is only one subcategory with the same items that
              // the parent and don't set subcategories. If this only subcat
              // has less items, show the subcategory
              hasSubCategories: (cat.headerCategorySubJsons !== null &&
                  cat.headerCategorySubJsons.length > 1 &&
                  cat.headerCategorySubJsons[0]
                    .productCount !== cat.productCount)
            };
            // If it has subCategories, fill it recursively
            if (category.hasSubCategories) {
              category.subCategories = fillCategories(
                cat.headerCategorySubJsons,
                false
              );
              if (!first && category.subCategories.length > 1) {
                category.subCategories.unshift({
                  name: 'Todos',
                  productsPage: true,
                  id: cat.id,
                  productCount: cat.productCount,
                  hasSubCategories: false
                });
              }
            }
            categories.push(category);
          });
          return categories;
        };

        $scope.categories = fillCategories(categoriesData, true);
      },

      /**
       * Show the store view
       */
      showView: function() {
        $scope.sections = [];

        var finished = 0;
        var totalLoad = 3;

        var finishedLoading = function() {
          finished += 1;
          if (finished === totalLoad) {
            // Set the STORE functions
            $scope.productGroupLimitSwap = helpers.productGroupLimitSwap;
            $scope.bannersLimitSwap = storeController.bannersLimitSwap;

            // Create the store page subviews status object and navigation
            // function
            $scope.storePage = {};
            $scope.storePage[storePage.HOME] = true;
            $scope.storePage[storePage.CATEGORIES] = false;
            $scope.storePage[storePage.SEARCH] = false;
            $scope.goToStorePage = navigationController.goToStorePage;

            // Set error and emptData to false
            $scope.error = false;
            $scope.noContent = false;

            // Remove the loader
            $scope.isLoading = false;
          }
        };

        appModel.getData(endPoint.STORE)
          .then(function(response) {
            $scope.store = response.data;
            storeController.organizeCategories(response.data.headerJson
              .headerCategoryJsons);

            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });

        appModel.getData(endPoint.BANNER)
          .then(function(response) {
            $scope.banners = {
              limit: 1,
              hasMoreBanners: response.data.length > 1,
              showMoreButton: response.data.length > 1,
              products: response.data
            };

            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });

        appModel.getData(endPoint.SECTIONS)
          .then(function(response) {
            for (var i = 0; i < response.data.length; i++) {
              var section = response.data[i];
              $scope.sections[section.position] = helpers.createProductGroup(
                section.name,
                section.offers
              );
            }
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
      }
    };

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** CATEGORY CONTROLLER  ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var categoryController = {
      showList: function(category) {
        console.log('Show the list!!!');
        $scope.category = category;
        $scope.isLoading = false;
      },
      showProducts: function(category) {
        console.log('LOAD THE PRODUCTS!!!');
        var maxItems = 120;
        var products = [];
        var calls = Math.floor(category.productCount / maxItems) + 1;

        var mergeProducts = function(newProducts) {
          products = products.concat(newProducts);
        };

        var callsMade = 0;
        var finish = function() {
          callsMade++;
          if (callsMade === calls) {
            helpers.setProductsPriceAndPromotion(products);

            $scope.category = category;
            $scope.products = products;
            $scope.isLoading = false;
          }
        };

        for (var i = 0; i < calls; i++) {
          var items = i + 1 === calls ?
                      category.productCount % maxItems :
                      maxItems;

          appModel.getData(endPoint._CATEGORY(category.id, i + 1, items))
          .then(
            function(response) {
              mergeProducts(response.data.products);
              finish();
            })
          .catch(function(err) {
            helpers.error(err);
          });
        }
      }
    };
    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** PRODUCT CONTROLLER * ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var productController = {
      /**
       * Show the product view
       * @param {String} productId The id of the product
       */
      showView: function(productId) {
        appModel.getData(endPoint._DETAIL(productId))
          .then(function(response) {
            // Product
            $scope.product = response.data;
            return productId;
          })
          .then(function(productId) {
            appModel.getData(endPoint._SIMILAR(productId))
              .then(function(response) {
                // Similar
                if (response.data.length > 0) {
                  $scope.hasSimilar = true;
                  $scope.similar = helpers.createProductGroup(
                    'Produtos relacionados',
                    response.data
                  );
                }

                $scope.showDescription = false;
                $scope.showTechDetails = false;
                $scope.localizeCurrency = helpers.localizeCurrency;
                $scope.accordionSwap = helpers.accordionSwap;
                $scope.productGroupLimitSwap = helpers.productGroupLimitSwap;

                $scope.isLoading = false;
              });
          })
          .catch(function(err) {
            helpers.error(err);
          });
      },
      /**
       * Create the product slider
       */
      slider: function() {
        $scope.slider = {};
        $scope.slider.sliderDelegate = null;
        $scope.sliderOptions = {
          initialSlide: 0,
          direction: 'horizontal',
          speed: 300,
          loop: false
        };
        // Slider watcher
        $scope.$watch(
          'slider.sliderDelegate', function(newVal) {
            if (newVal !== null) {
              $scope.slider.sliderDelegate
                .on('slideChangeEnd', function() {
                  $scope.slider.currentPage = $scope.slider
                                .sliderDelegate.activeIndex;
                  // use $scope.$apply() to refresh any content external to the slider
                  $scope.$apply();
                });
            }
          });
      }
    };

    /** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ROUTER * ** ** ** ** ** ** ** ** ** ** ** **
     ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **/
    var router = function() {
      helpers.clearLog();
      console.debug('router()');

      // Set general status
      $scope.isLoading = true;
      helpers.setCartContextualAction();
      appModel.loadInstanceData()
        .then(function() {
          // Make the general functions avalable in the scope
          helpers.injectStyle();
          $scope.page = page;
          $scope.isAndroid = $mPlatform.isAndroid();
          $scope.isIos = $mPlatform.isIOS();

          // Make all navigation available in the scope
          $scope.goToProduct = navigationController.goToProduct;
          $scope.goToCategory = navigationController.goToCategory;

          var detail = $stateParams.detail.split('&');
          $scope.view = detail[0] === '' ? page.STORE : detail[0];
          $stateParams.detail = detail[1] === undefined ? '' : detail[1];

          // Decide where to go based on the $stateParams
          if ($scope.view === page.STORE) {
            /** STORE PAGE **/
            storeController.showView();
          } else if ($scope.view === page.CATEGORY) {
            console.debug('CATEGORY');
            categoryController.showList($rootScope.category);
          } else if ($scope.view === page.CATEGORY_PRODUCTS) {
            console.debug('CATEGORY');
            var category = $rootScope.category;
            categoryController.showProducts(category);
          } else if ($scope.view === page.PRODUCT) {
            /** SUBCATEGORY PAGE **/
            console.debug('PRODUCT');
            $scope.productId = $stateParams.detail;
            productController.showView($scope.productId);
          } else if ($scope.view === page.CART) {
            /** CART PAGE **/
            console.debug('CART');
          }
        })
        .catch(function(err) {
          helpers.error(err);
        });
    };

    router();
  }
};
