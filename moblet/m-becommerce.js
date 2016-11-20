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
    var page = {
      STORE: 'store',
      CATEGORY: 'category',
      SUBCATEGORY: 'subcategory',
      PRODUCT: 'product',
      CART: 'cart'
    };
    var model = {
      loadInstanceData: function() {
        var deferred = $q.defer();
        var dataLoadOptions = {
          cache: false
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
          .catch(function(error) {
            console.error(error);
            deferred.reject('no data found');
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
            function(error) {
              console.error(error);
              deferred.reject(error);
            }
        );
        return deferred.promise;
      }
    };
    var helpers = {
      localizeCurrency: function(value) {
        var corrected = $filter('currency')(value, "R$", 2);
        var splited = corrected.split('.');
        var localized = splited[0].replace(',', '.') + '.' + splited[1];
        return localized;
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
        model.getData($scope.instanceData.detail(productId))
          .then(function(response) {
            console.log(response.data);
            $stateParams.detail = page.PRODUCT + '&' + productId;
            $state.go('pages', $stateParams);
          })
          .catch(function(error) {
            console.error(error);
          });
      },
      /**
       * Show the moblet main view
       * @param {Object} data The data from the instance plus all API URLs
       * @return {Promise} Show the store view when all needed data is loaded
       */
      showView: function() {
        var deferred = $q.defer();

        if (isDefined($scope.instanceData)) {
          $scope.sections = [];

          var finished = 0;
          var totalLoad = 5;
          var sectionLimit = 4;

          var finishedLoading = function() {
            finished += 1;
            if (finished === totalLoad) {
              // Set the view
              $scope.view = page.STORE;
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

              deferred.resolve();
            }
          };

          model.getData($scope.instanceData.store)
            .then(function(response) {
              $scope.store = response.data;
              $scope.categories = response.data.headerJson.headerCategoryJsons;
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });

          model.getData($scope.instanceData.banner)
            .then(function(response) {
              $scope.banners = response.data;
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData($scope.instanceData.sections.section3)
            .then(function(response) {
              $scope.sections[0] = {
                name: 'Vitrine 1',
                limit: sectionLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData($scope.instanceData.sections.section4)
            .then(function(response) {
              $scope.sections[1] = {
                name: 'Vitrine 2',
                limit: sectionLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData($scope.instanceData.sections.section5)
            .then(function(response) {
              $scope.sections[2] = {
                name: 'Vitrine 3',
                limit: sectionLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
        } else {
          $scope.isLoading = false;

          $scope.error = true;
          $scope.noContent = true;

          deferred.reject();
        }

        return deferred.promise;
      }
    };

    var router = function() {
      console.debug('router()');
      // Set general status
      $scope.isLoading = true;
      $scope.colors = $mAppDef().load().colors;
      // Make the general helper functions avalable in the scope
      $scope.localizeCurrency = helpers.localizeCurrency;

      // Decide where to go based on the $stateParams
      if ($stateParams.detail === '') {
        console.debug('STORE');
        /** STORE PAGE **/
        // Load the appDef data
        // TODO Put this in the top, outside the store view
        model.loadInstanceData()
          .then(function() {
            // Show the store view
            storeController.showView();
          })
          .catch(function(error) {
            console.error(error);
            $scope.isLoading = false;
            $scope.error = true;
          });
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
    };

    window.malbumImageLoaded = function(element) {
      element.parentElement.classList.add("loaded");
    };
    router();
  }
};
