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
              clientId: data.clientId,
              store: data.apiUrl + 'common/conf/store/',
              sections: {
                3: data.apiUrl + 'product/list/section/3/',
                4: data.apiUrl + 'product/list/section/4/',
                5: data.apiUrl + 'product/list/section/5/'
              },
              // banner: data.apiUrl + 'app_banner/list/section/',
              banner: data.apiUrl + 'slider/list/section/',
              detail: function(productId) {
                return data.apiUrl + 'product/detail/' + productId;
              },
              similar: function(productId) {
                return data.apiUrl + 'product/list/similar/' +
                       productId;
              },
              cart: data.apiUrl + 'cart/',
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
    //   getHeight: function() {
    //     var maxHeight = 0;
    //     for (var i = 0; i < $scope.slider.length; i++) {
    //       var tmpImg = new Image();
    //       tmpImg.src = $scope.slider[i].image;
    //       tmpImg.onload = function() {
    //         var proportion = window.screen.width / tmpImg.width;
    //         var height = tmpImg.height * proportion;
    //         maxHeight = height > maxHeight ? height : maxHeight;
    //         $timeout(function() {
    //           $scope.slider.height = maxHeight + 10 + 'px';
    //         }, 10);
    //       };
    //     }
    //   },
    //   startSlider: function() {
    //     function getNext(value) {
    //       if (value < loopCount) {
    //         return value + 1;
    //       } else {
    //         return 0;
    //       }
    //     }
    //
    //     var loopCount = $scope.slider.length - 1;
    //     var current = 0;
    //     var previous = loopCount;
    //     var next = getNext(current);
    //
    //     $scope.slider[current].currentSlide = ' current-slide';
    //     $scope.slider[next].nextSlide = ' next-slide';
    //
    //     $interval(function() {
    //       previous = current;
    //       current = getNext(current);
    //       next = getNext(current);
    //
    //       $scope.slider[current].currentSlide = ' current-slide';
    //       $scope.slider[current].nextSlide = '';
    //
    //       $scope.slider[previous].currentSlide = '';
    //
    //       $scope.slider[next].nextSlide = ' next-slide';
    //     }, 3000);
    //     ecommet.getHeight();
    //   },
    //   getData: function(url, callback) {
    //     $http.get(apiUrl + url)
    //       .then(
    //         function(response) {
    //           callback(false, response);
    //         },
    //         function(error) {
    //           console.log(error);
    //           calback(true);
    //         }
    //       );
    //   },
    //   /**
    //    * Set the view and update the needed parameters
    //    * @param  {object} data Data received from Moblets backend
    //    * @param  {boolean} more If called by "more" function, it will add the
    //    * data to the items array
    //    */
    //   /**
    //    * Check if the view is showing a detail or the list. The function checks
    //    * if $stateParams.detail is set.
    //    * @return {boolean} True if the view must show a detail.
    //    */
    //   isDetail: function() {
    //     return $stateParams.detail !== "";
    //   },
    //   /**
    //    * Show the detail getting the index from $stateParams.detail. Set "item"
    //    * to the selected detail
    //    */
    //   // showDetail: function(detailIndex) {
    //   //   if (isDefined($stateParams.detail) && $stateParams.detail !== "") {
    //   //     var itemIndex = _.findIndex($scope.items, function(item) {
    //   //       return item.id.toString() === $stateParams.detail;
    //   //     });
    //   //     if (itemIndex === -1) {
    //   //       dataLoadOptions = {
    //   //         offset: $scope.items === undefined ? 0 : $scope.items.length,
    //   //         items: 25,
    //   //         cache: false
    //   //       };
    //   //       list.load(false, function() {
    //   //         list.showDetail();
    //   //       });
    //   //     } else {
    //   //       $scope.detail = $scope.items[itemIndex];
    //   //     }
    //   //   } else if (isDefined(detailIndex)) {
    //   //     $scope.detail = $scope.items[detailIndex];
    //   //   }
    //   // },
    //   /**
    //    * Load data from the Moblets backend:
    //    * - show the page loader if it's called by init (sets showLoader to true)
    //    * - Use $mDataLoader.load to get the moblet data from Moblets backend.
    //    * 	 The parameters passed to $mDataLoader.load are:
    //    * 	 - $scope.moblet - the moblet created in the init function
    //    * 	 - false - A boolean that sets if you want to load data from the
    //    * 	   device storage or from the Moblets API
    //    * 	 - dataLoadOptions - An object with parameters for pagination
    //    * @param  {boolean} showLoader Boolean to determine if the page loader
    //    * is active
    //    * @param {function} callback Callback
    //    */
      showMainView: function(data) {
        var deferred = $q.defer();
        var finished = 0;
        var totalLoad = 2;
        function finishedLoading() {
          finished += 1;
          if (finished === totalLoad) {
            deferred.resolve();
          }
        }

        if (isDefined(data)) {
          $scope.error = false;
          $scope.emptyData = false;
          apiUrl = data.apiUrl;

          model.getData(data.store)
            .then(function(response) {
              $scope.store = response.data;
              finishedLoading();
            })
            .catch(function(error) {
              console.error(error);
            });
          model.getData(data.banner)
            .then(function(response) {
              $scope.banners = response.data;
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
    // // var listItem = {
    //   goTo: function(detail) {
    //     $stateParams.detail = detail.id;
    //     $state.go('pages', $stateParams);
    //   }
    // };
    controller.init();
  }
};
