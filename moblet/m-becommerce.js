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
       * @return {Promise}
       */
      showMainView: function(data) {
        var deferred = $q.defer();
        var finished = 0;
        var totalLoad = 5;

        var finishedLoading = function() {
          finished += 1;
          if (finished === totalLoad) {
            deferred.resolve('ok');
          }
        };

        if (isDefined(data)) {
          $scope.error = false;
          $scope.emptyData = false;
          apiUrl = data.apiUrl;

          model.getData(data.store)
            .then(function(response) {
              $scope.store = response.data;
              $scope.categories = response.data.headerJson.headerCategoryJsons;
              console.log($scope.store);
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });

          model.getData(data.banner)
            .then(function(response) {
              $scope.banners = response.data;
              console.log($scope.banners);
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData(data.sections.section3)
            .then(function(response) {
              $scope.section3 = response.data;
              console.log($scope.section3);
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData(data.sections.section4)
            .then(function(response) {
              $scope.section4 = response.data;
              console.log($scope.section4);
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData(data.sections.section5)
            .then(function(response) {
              $scope.section5 = response.data;
              console.log($scope.section5);
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
        // Check if the page is loading the list or a detail
        // $scope.isDetail = list.isDetail();
          // $scope.isDetail = false;
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
        $scope.isLoading = true;
        model.setInstanceData()
          .then(function(data) {
            console.debug(instanceData);
            return controller.showMainView(data);
          })
          .then(function(viewStatus) {
            console.log(viewStatus);
            $scope.isLoading = false;
          })
          .catch(function(error) {
            console.error(error);
            $scope.isLoading = false;
            $scope.error = true;
          });
      }
    };
    controller.init();
  }
};
