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
    $filter,
    $interval,
    $timeout,
    $state,
    $stateParams,
    $mDataLoader,
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

    var storeController = {
      loadMoreFromSection: function(section) {
        section.limit = section.products.length;
        $scope.isLoading = true;
        $timeout(function() {
          $scope.isLoading = false;
          // Broadcast complete refresh and infinite scroll
          $rootScope.$broadcast('scroll.refreshComplete');
          $rootScope.$broadcast('scroll.infiniteScrollComplete');
        }, 500);
      },
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
            $scope.loadMore = storeController.loadMoreFromSection;
            $scope.goToProduct = storeController.goToProduct;
            // Set error and emptData to false
            $scope.error = false;
            $scope.noContent = false;

            // Remove the loader
            $scope.isLoading = false;

            // Broadcast complete refresh and infinite scroll
            $rootScope.$broadcast('scroll.refreshComplete');
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
          }
        };

        appModel.getData($scope.instanceData.store)
          .then(function(response) {
            $scope.store = response.data;
            $scope.categories = response.data.headerJson.headerCategoryJsons;
            finishedLoading();
          })
          .catch(function(err) {
            helpers.error(err);
          });

        appModel.getData($scope.instanceData.banner)
          .then(function(response) {
            $scope.banners = response.data;
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

    var router = function() {
      console.debug('router()');
      // Set general status
      $scope.isLoading = true;
      appModel.loadInstanceData()
        .then(function() {
          // Make the general functions avalable in the scope
          $scope.colors = $mAppDef().load().colors;
          $scope.localizeCurrency = helpers.localizeCurrency;

          // Decide where to go based on the $stateParams
          if ($stateParams.detail === '') {
            console.debug('STORE');
            // Set the view
            $scope.view = page.STORE;
            // Show the store view
            storeController.showView();
          } else {
            var detail = $stateParams.detail.split('&');
            $scope.view = detail[0];
            $stateParams.detail = detail[1];
            if ($scope.view === page.CATEGORY) {
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
          }
        })
        .catch(function(err) {
          helpers.error(err);
        });
    };

    router();
  }
};
