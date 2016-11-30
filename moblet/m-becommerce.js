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

    var page = {
      STORE: 'store',
      CATEGORY: 'category',
      SUBCATEGORY: 'subcategory',
      PRODUCT: 'product',
      CART: 'cart'
    };

    var menuButton = {
      HOME: 'isButtonHomeActive',
      CATEGORIES: 'isButtonCategoriesActive'
    };

    var platform = {
      ANDROID: 'android',
      IOS: 'ios'
    };

    var groupLimit = 4;

    var helpers = {
      error: function(err) {
        $scope.isLoading = false;
        $scope.error = true;
        $scope.noContent = true;
        console.error(err);
      },
      localizeCurrency: function(value) {
        var corrected = $filter('currency')(value, "R$", 2);
        var splited = corrected.split('.');
        var localized = splited[0].replace(',', '.') + ',' + splited[1];
        return localized;
      },
      colors: function() {
        var colors = $mAppDef().load().colors;
        colors.darker = $mTheme.shadeColor(colors.header_color, -0.2);
        colors.lighter = $mTheme.shadeColor(colors.header_color, 0.2);
        return colors;
      },
      addCartContextualAction: function() {
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
      scrollToId: function(id) {
        var top = document.getElementById(id).offsetTop;
        $ionicScrollDelegate.scrollTo(0, top, true);
      },
      setProductPrice: function(products) {
        // var responseList = products;
        for (var i = 0; i < products.length; i++) {
          if (products[i].valueFrom &&
            products[i].valueFrom > products[i].valueTo) {
            products[i].hasPromotion = true;
            products[i].valueFrom = helpers.localizeCurrency(
              products[i].valueFrom);
            products[i].valueTo = helpers.localizeCurrency(
              products[i].valueTo);
          } else {
            products[i].hasPromotion = false;
          }
        }
      },
      /**
       * Change a section's ng-repeat limit to show all products
       * @param  {Object} productGroup The $scope product group with it's
       *                               products
       * @param  {String} groupId      The html id of the product group
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
      createProductGroup: function(name, data) {
        helpers.setProductPrice(data);
        var productGroup = {
          name: name,
          limit: data.length < groupLimit ? data.length : groupLimit,
          hasProducts: data.length > 0,
          hasMoreProducts: data.length > groupLimit,
          showSwapButton: data.length > groupLimit,
          products: data
        };
        return productGroup;
      },
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
      accordionSwap: function(accordionToggleName) {
        $scope[accordionToggleName] = !$scope[accordionToggleName];

        // Wait for the animation to finish
        $timeout(function() {
          $ionicScrollDelegate.resize();
        }, 350);
      }
    };

    var appModel = {
      loadInstanceData: function() {
        var deferred = $q.defer();
        var dataLoadOptions = {
          cache: ($stateParams.detail !== "")
        };

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            $scope.instanceData = {
              apiUrl: data.apiUrl,
              clientUrl: data.clientUrl,
              store: data.apiUrl + 'common/conf/store/',
              // banner: data.apiUrl + 'app_banner/list/section/',
              banner: data.apiUrl + 'slider/list/section/',
              cart: data.apiUrl + 'cart/',
              sections: {
                section3: data.apiUrl + 'product/list/section/3/',
                section4: data.apiUrl + 'product/list/section/4/',
                section5: data.apiUrl + 'product/list/section/5/'
              },
              detail: function(productId) {
                return data.apiUrl + 'product/detail/' + productId;
              },
              similar: function(productId) {
                return data.apiUrl + 'product/list/similar/' +
                  productId;
              },
              shipping: function(zipCode, productId) {
                return data.apiUrl + 'cart/shipping-list/' +
                  zipCode + '/' + productId + '/1';
              }
            };
            deferred.resolve();
          })
          .catch(function(err) {
            helpers.error(err);
            deferred.reject(err);
          });
        return deferred.promise;
      },
      getData: function(url) {
        var deferred = $q.defer();
        $http.get(url)
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

    navigationController = {
      /**
       * Got to a product's page
       * @param  {Number} productId The product ID
       */
      goToProduct: function(productId) {
        $stateParams.detail = page.PRODUCT + '&' + productId;
        $state.go('pages', $stateParams);
      }
    /**
     * Go to the highlights page
     * @return {[type]} [description]
     */
    // goToHighlights: function() {
    //   $stateParams.detail = page.HIGHLIGHTS;
    //   $state.go('pages', $stateParams);
    // },
    };
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

      /**
       * Show the moblet main view
       */
      showView: function() {
        $scope.sections = [];

        var finished = 0;
        var totalLoad = 5;

        var finishedLoading = function() {
          finished += 1;
          if (finished === totalLoad) {
            // Set the STORE functions
            $scope.productGroupLimitSwap = helpers.productGroupLimitSwap;
            $scope.bannersLimitSwap = storeController.bannersLimitSwap;
            $scope[menuButton.HOME] = true;
            $scope[menuButton.CATEGORIES] = false;

            // Set error and emptData to false
            $scope.error = false;
            $scope.noContent = false;

            // Remove the loader
            $scope.isLoading = false;
          }
        };

        appModel.getData($scope.instanceData.store)
          .then(function(response) {
            $scope.store = response.data;
            $scope.categories = response.data.headerJson.headerCategoryJsons;

            // Save the categories in the root scope
            $rootScope.categories = $scope.categories;
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.banner)
          .then(function(response) {
            $scope.banners = {
              limit: 1,
              hasMoreBanners: response.data.length > 1,
              showMoreButton: response.data.length > 1,
              products: response.data
            };

            // Save the banners in the root scope
            $rootScope.banners = $scope.banners;
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section3)
          .then(function(response) {
            $scope.sections[0] = helpers.createProductGroup(
              'Vitrine 1',
              response.data
            );
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section4)
          .then(function(response) {
            $scope.sections[1] = helpers.createProductGroup(
              'Vitrine 2',
              response.data
            );
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section5)
          .then(function(response) {
            $scope.sections[2] = helpers.createProductGroup(
              'Vitrine 3',
              response.data
            );
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
      }
    };

    var productController = {
      showView: function(productId) {
        appModel.getData($scope.instanceData.detail(productId))
          .then(function(response) {
            // Product
            console.log(response.data);
            $scope.product = response.data;
            return productId;
          })
          .then(function(productId) {
            appModel.getData($scope.instanceData.similar(productId))
              .then(function(response) {
                // Similar
                if (response.data.length > 0) {
                  $scope.hasSimilar = true;
                  $scope.similar = helpers.createProductGroup(
                    'Produtos relacionados',
                    response.data
                  );
                }
                console.log($scope.similar);

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
          'slider.sliderDelegate', function(newVal, oldVal) {
            if (newVal != null) {
              $scope.slider.sliderDelegate
                .on('slideChangeEnd', function() {
                  $scope.slider.currentPage = $scope.slider.sliderDelegate.activeIndex;
                  // use $scope.$apply() to refresh any content external to the slider
                  $scope.$apply();
                });
            }
          });
      }
    };

    // var highlightsController = {
    //   showView: function() {
    //     $scope.banners = $rootScope.banners;
    //     $scope.isLoading = false;
    //   // $scope.banners = response.data;
    //   }
    // };
    var router = function() {
      console.debug('router()');
      // Set general status
      helpers.addCartContextualAction();
      $scope.isLoading = true;
      appModel.loadInstanceData()
        .then(function() {
          // Make the general functions avalable in the scope
          $scope.colors = helpers.colors();
          $scope.page = page;
          $scope.platform = $mPlatform.isAndroid() ?
            platform.ANDROID :
            platform.IOS;

          // Make all navigation available in the scope
          $scope.goToProduct = navigationController.goToProduct;
          // $scope.goToCategory = navigationController.goToCategory;

          var detail = $stateParams.detail.split('&');
          $scope.view = detail[0] === '' ? page.STORE : detail[0];
          $stateParams.detail = detail[1] === undefined ? '' : detail[1];

          // Decide where to go based on the $stateParams
          if ($scope.view === page.STORE) {
            /** STORE PAGE **/
            storeController.showView();
          } else if ($scope.view === page.CATEGORY) {
            /** PRODUCT PAGE **/
            console.debug('CATEGORY');
          } else if ($scope.view === page.SUBCATEGORY) {
            /** CATEGORY PAGE **/
            console.debug('SUBCATEGORY');
          } else if ($scope.view === page.PRODUCT) {
            /** SUBCATEGORY PAGE **/
            console.debug('PRODUCT');
            helpers.clearLog();

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
