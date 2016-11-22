/* eslint no-undef: [0]*/
module.exports = {
  title: "mBecommerce",
  style: "m-becommerce.less",
  template: 'm-becommerce.html',
  i18n: {
    pt: "lang/pt-BR.json"
  },
  link: function() {
    $mInjector.inject('https://cdnjs.cloudflare.com/ajax/libs/angular-i18n/1.5.8/angular-locale_pt-br.min.js');
  },
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

    var platform = {
      ANDROID: 'android',
      IOS: 'ios'
    };

    var helpers = {
      error: function() {
        $scope.isLoading = false;
        $scope.error = true;
        $scope.noContent = true;
      },
      localizeCurrency: function(value) {
        var corrected = $filter('currency')(value, "R$", 2);
        var splited = corrected.split('.');
        var localized = splited[0].replace(',', '.') + '.' + splited[1];
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
        $ionicScrollDelegate.resize();
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
        console.log(productId);
        appModel.getData($scope.instanceData.detail(productId))
          .then(function(response) {
            console.log(response.data);
            $stateParams.detail = page.PRODUCT + '&' + productId;
            $state.go('pages', $stateParams);
          })
          .catch(function(err) {
            helpers.error(err);
            console.error(err);
          });
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
       * Change a section's ng-repeat limit to show all products
       * @param  {Object} section The section object with it's products
       */
      loadMoreFromSection: function(section, sectionIndex) {
        section.limit = section.products.length;

        // Scroll and resize
        helpers.scrollToId('section-' + sectionIndex + '-product-3');
      },
      /**
       * Change the banners ng-repeat limit to show all banners
       */
      bannersLimitSwap: function() {
        $scope.bannersLimit = $scope.bannersLimit === 1 ?
          $scope.banners.length :
          1;

        // Scroll and resize
        helpers.scrollToId('banner-container');
      },

      /**
       * Show the moblet main view
       */
      showView: function() {
        $scope.sections = [];

        var finished = 0;
        var totalLoad = 5;
        var sectionLimit = 4;

        var finishedLoading = function() {
          finished += 1;
          if (finished === totalLoad) {
            // Set the STORE functions
            $scope.loadMoreFromSection = storeController.loadMoreFromSection;
            $scope.bannersLimitSwap = storeController.bannersLimitSwap;

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
            $scope.banners = response.data;
            $scope.bannersLimit = 1;

            // Save the banners in the root scope
            $rootScope.banners = $scope.banners;
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section3)
          .then(function(response) {
            $scope.sections[0] = {
              name: 'Vitrine 1',
              limit: sectionLimit,
              products: response.data
            };
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section4)
          .then(function(response) {
            $scope.sections[1] = {
              name: 'Vitrine 2',
              limit: sectionLimit,
              products: response.data
            };
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
        appModel.getData($scope.instanceData.sections.section5)
          .then(function(response) {
            $scope.sections[2] = {
              name: 'Vitrine 3',
              limit: sectionLimit,
              products: response.data
            };
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });
      }
    };

    var highlightsController = {
      showView: function() {
        $scope.banners = $rootScope.banners;
        $scope.isLoading = false;
      // $scope.banners = response.data;
      }
    };
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
          $scope.localizeCurrency = helpers.localizeCurrency;
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
            $scope.productId = $stateParams.detail;
            $scope.isLoading = false;
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
