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
    var instanceData = {};
    var model = {
      dataLoadOptions: {
        cache: ($stateParams.detail !== "")
      },
      setInstanceData: function() {
        var deferred = $q.defer();
        $mDataLoader.load($scope.moblet, model.dataLoadOptions)
          .then(function(data) {
            instanceData = {
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
            deferred.resolve(instanceData);
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
    // getData: function(url, callback) {
    //   $http.get(apiUrl + url)
    //     .then(
    //       function(response) {
    //         callback(false, response);
    //       },
    //       function(error) {
    //         console.log(error);
    //         calback(true);
    //       }
    //     );
    // }
    };
    // var dataLoadOptions;
    // var apiUrl = '';
    var controller = {
      localizeCurrency: function(value) {
        var corrected = $filter('currency')(value, "R$", 2);
        var splited = corrected.split('.');
        var localized = splited[0].replace(',', '.') + '.' + splited[1];
        return localized;
      },
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
            $stateParams.detail = 'product/' + productId;
            $scope.view = 'product';
            $state.go('pages', $stateParams);
          })
          .catch(function(error) {
            console.error(error);
          });
      },
      /**
       * Check if the view is showing a detail or the list. The function checks
       * if $stateParams.detail is set.
       * @return {boolean} True if the view must show a detail.
       */
      // isDetail: function() {
      //   return $stateParams.detail !== "";
      // },
      /**
       * Show the detail getting the index from $stateParams.detail. Set "item"
       * to the selected detail
       */
      // showDetail: function(detailIndex) {
      //   if (isDefined($stateParams.detail) && $stateParams.detail !== "") {
      //     var itemIndex = _.findIndex($scope.items, function(item) {
      //       return item.id.toString() === $stateParams.detail;
      //     });
      //     if (itemIndex === -1) {
      //       dataLoadOptions = {
      //         offset: $scope.items === undefined ? 0 : $scope.items.length,
      //         items: 25,
      //         cache: false
      //       };
      //       list.load(false, function() {
      //         list.showDetail();
      //       });
      //     } else {
      //       $scope.detail = $scope.items[itemIndex];
      //     }
      //   } else if (isDefined(detailIndex)) {
      //     $scope.detail = $scope.items[detailIndex];
      //   }
      // },
      /**
       * Show the moblet main view
       * @param {Object} data The data from the instance plus all API URLs
       * @return {Promise} Show the store view when all needed data is loaded
       */
      prepareStoreView: function() {
        var deferred = $q.defer();
        var finished = 0;
        var totalLoad = 5;
        var originalSectionsLimit = 4;
        var sections = [];

        var finishedLoading = function() {
          finished += 1;
          if (finished === totalLoad) {
            $scope.view = 'store';
            $scope.sections = sections;
            $scope.loadMore = controller.loadMoreFromSection;
            $scope.goToProduct = controller.goToProduct;

            deferred.resolve();
          }
        };

        if (isDefined($scope.instanceData)) {
          $scope.error = false;
          $scope.emptyData = false;

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
              sections[0] = {
                name: 'Vitrine 1',
                limit: originalSectionsLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData($scope.instanceData.sections.section4)
            .then(function(response) {
              sections[1] = {
                name: 'Vitrine 2',
                limit: originalSectionsLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData($scope.instanceData.sections.section5)
            .then(function(response) {
              sections[2] = {
                name: 'Vitrine 3',
                limit: originalSectionsLimit,
                products: response.data
              };
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
        } else {
          $scope.error = true;
          $scope.emptyData = true;
        }

        // Broadcast complete refresh and infinite scroll
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');
        return deferred.promise;
      },

      init: function() {
        // Set general status
        $scope.isLoading = true;
        $scope.localizeCurrency = controller.localizeCurrency;
        $scope.colors = $mAppDef().load().colors;
        console.log($stateParams);
        if ($stateParams.detail === '') {
          // Load the appDef data
          model.setInstanceData()
            .then(function(data) {
              // Save the instance in the scope
              $scope.instanceData = data;
              // Prepare the index (store view)
              return controller.prepareStoreView();
            })
            .then(function() {
              $scope.isLoading = false;
            })
            .catch(function(error) {
              console.error(error);
              $scope.isLoading = false;
              $scope.error = true;
            });
        } else {
          var params = $stateParams.detail.split('/');
          if (params[0] === 'product') {
            console.log(params[1]);
          }
        }
      }
    };

    window.malbumImageLoaded = function(element) {
      element.parentElement.classList.add("loaded");
    };
    controller.init();
  }
};
