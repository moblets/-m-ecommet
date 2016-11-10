/* eslint no-undef: [0]*/
module.exports = {
  title: "mEcommet",
  style: "m-ecommet.less",
  template: 'm-ecommet.html',
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
    $http
  ) {
    var dataLoadOptions;
    var apiUrl = '';
    var ecommet = {
      getHeight: function() {
        var maxHeight = 0;
        for (var i = 0; i < $scope.slider.length; i++) {
          var tmpImg = new Image();
          tmpImg.src = $scope.slider[i].image;
          tmpImg.onload = function () {
            var proportion = window.screen.width / tmpImg.width;
            var height = tmpImg.height * proportion;
            maxHeight = height > maxHeight ? height : maxHeight;
            $timeout(function () {
              $scope.slider.height = maxHeight + 10 + 'px';
            }, 10);
          }
        }
      },
      startSlider: function() {
        function getNext(value) {
          if (value < loopCount) {
            return value + 1;
          } else {
            return 0;
          }
        }

        var loopCount = $scope.slider.length - 1;
        var current = 0;
        var previous = loopCount;
        var next = getNext(current);

        $scope.slider[current].currentSlide = ' current-slide';
        $scope.slider[next].nextSlide = ' next-slide';

        $interval(function () {
            previous = current;
            current = getNext(current);
            next = getNext(current);

            $scope.slider[current].currentSlide = ' current-slide';
            $scope.slider[current].nextSlide = '';

            $scope.slider[previous].currentSlide = '';

            $scope.slider[next].nextSlide = ' next-slide';
          }, 3000);
        ecommet.getHeight();
      },
      getData: function(url, callback) {
        $http.get(apiUrl + url)
          .then(
            function(response) {
              callback(false, response);
            },
            function(error) {
              console.log(error);
              calback(true)
            }
          );
      },
      /**
       * Set the view and update the needed parameters
       * @param  {object} data Data received from Moblets backend
       * @param  {boolean} more If called by "more" function, it will add the
       * data to the items array
       */
      setView: function(data) {
        var count = 0;
        function finishedLoading () {
          count += 1;
          if (count === 2) {
            $scope.isLoading = false;
          }
        }
        if (isDefined(data)) {
          $scope.error = false;
          $scope.emptyData = false;
          apiUrl = data.apiUrl;
          ecommet.getData('common/conf/store', function(error, response) {
            if (error) {
              console.log(response);
            } else {
              $scope.store = response.data;
              finishedLoading();
            }
          });
          ecommet.getData('slider/list/section', function(error, response) {
            if (error) {
              console.log(response);
            } else {
              $scope.slider = response.data;
              ecommet.startSlider();
              finishedLoading();
            }
          });
          // set empty itens if no content
          if ($scope.noContent) {
            $scope.items = [];
          }

          // Check if the page is loading the list or a detail
          // $scope.isDetail = list.isDetail();
          $scope.isDetail = false;
        } else {
          $scope.error = true;
          $scope.emptyData = true;
        }

        // Broadcast complete refresh and infinite scroll
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');

        // If the view is showing the detail, call showDetail
        // if ($scope.items.length === 1) {
        //   $scope.isDetail = true;
        //   list.showDetail(0);
        // } else if ($scope.isDetail) {
        //   list.showDetail();
        // }

        // Remove the loading animation

      },
      /**
       * Check if the view is showing a detail or the list. The function checks
       * if $stateParams.detail is set.
       * @return {boolean} True if the view must show a detail.
       */
      isDetail: function() {
        return $stateParams.detail !== "";
      },
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
       * Load data from the Moblets backend:
       * - show the page loader if it's called by init (sets showLoader to true)
       * - Use $mDataLoader.load to get the moblet data from Moblets backend.
       * 	 The parameters passed to $mDataLoader.load are:
       * 	 - $scope.moblet - the moblet created in the init function
       * 	 - false - A boolean that sets if you want to load data from the
       * 	   device storage or from the Moblets API
       * 	 - dataLoadOptions - An object with parameters for pagination
       * @param  {boolean} showLoader Boolean to determine if the page loader
       * is active
       * @param {function} callback Callback
       */
      loadMainPage: function(showLoader, callback) {
        $scope.isLoading = showLoader || false;
        // mDataLoader also saves the response in the local cache. It will be
        // used by the "showDetail" function
        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            ecommet.setView(data);
            if (typeof callback === 'function') {
              callback();
            }
          }
        );
      },
      /**
       * Initiate the list moblet:
       * - put the list.load function in the $scope
       * - run list.load function
       */
      init: function() {
        dataLoadOptions = {
          cache: ($stateParams.detail !== "")
        };
        ecommet.loadMainPage(true);
      }
    };
    // var listItem = {
    //   goTo: function(detail) {
    //     $stateParams.detail = detail.id;
    //     $state.go('pages', $stateParams);
    //   }
    // };
    ecommet.init();
  }
};
