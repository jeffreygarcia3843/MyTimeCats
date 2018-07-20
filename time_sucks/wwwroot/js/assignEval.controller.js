﻿angular.module('time').controller('AssignEvalCtrl', ['$scope', '$http', '$routeParams', '$location', 'usSpinnerService', function ($scope, $http, $routeParams, $location, usSpinnerService) {
    $scope.loaded = false;
    $scope.config = {};
    $scope.config.selectAll = false;
    $scope.course = {};
    $scope.course.projects = {};
    $scope.course.evaluations = {};

    $scope.load = function () {
        $scope.courseID = $routeParams.ID;

        if (!$scope.courseID) window.history.back();

        usSpinnerService.spin('spinner');
        $http.post("/Home/GetCourseForEvals", { courseID: $scope.courseID })
            .then(function (response) {
                usSpinnerService.stop('spinner');
            }, function () {
                usSpinnerService.stop('spinner');
                toastr["error"]("Failed to retrieve course. Using Dummy Data.");

                //Dummy Data
                $scope.course = {
                    courseID: $scope.courseID,
                    courseName: 'Test Course'
                }
                $scope.course.projects = {
                    0: {
                        projectID: 1,
                        projectName: 'Test Project 1',
                            isActive: true,
                            isSelected: false
                    },
                    1: {
                        projectID: 2,
                        projectName: 'Test Project 2',
                        isActive: true,
                        isSelected: false
                    },
                    2: {
                        projectID: 3,
                        projectName: 'TestProject 3',
                        isActive: true,
                        isSelected: false
                    }
                }
                $scope.course.evaluations = {
                    0: {
                        evalTemplateID: 1,
                        templateName: "Test Evalation Template 1",
                        isSelected: false
                    },
                    1: {
                        evalTemplateID: 2,
                        templateName: "Test Evalation Template 2",
                        isSelected: false
                    },
                    2: {
                        evalTemplateID: 3,
                        templateName: "Test Evalation Template 3",
                        isSelected: false
                    }
                }
            });

        $scope.hasProjects = function () {
            if ($scope.course) return !angular.equals([], $scope.course.projects);
            return false;
        };

        $scope.toggleSelectAll = function () {
            if ($scope.config.selectAll) {
                for (i = 0; i < Object.keys($scope.course.projects).length; i++) {
                    $scope.course.projects[i].isSelected = true;
                }
            } else {
                for (i = 0; i < Object.keys($scope.course.projects).length; i++) {
                    $scope.course.projects[i].isSelected = false;
                }
            }
        };

        $scope.uncheckSelectAll = function (isSelected) {
            if (!isSelected) $scope.config.selectAll = false;
        };

        $scope.assignEvaluation = function () {
            projectIDs = [];
            for (i = 0; i < Object.keys($scope.course.projects).length; i++) {
                if ($scope.course.projects[i].isSelected) projectIDs.push($scope.course.projects[i].projectID);
            }

            evalTemplateID = 0;
            for (i = 0; i < Object.keys($scope.course.evaluations).length; i++) {
                if ($scope.course.evaluations[i].isSelected) evalTemplateID = $scope.course.evaluations[i].evalTemplateID;
            }

            if (projectIDs.length < 1) {
                toastr["error"]("You must select at least one project to assign the evaluation to.");
                return;
            }
            if (evalTemplateID === 0) {
                toastr["error"]("You must select an evaluation to assign to the selected projects.");
                return;
            }

            $http.post("/Home/AssignEvaluation", { projectIDs: projectIDs })
                .then(function (response) {
                    usSpinnerService.stop('spinner');
                }, function () {
                    usSpinnerService.stop('spinner');
                    toastr["error"]("Failed to assign the evaluation, endpoint not defined.");
                });

        }
        
        $scope.loaded = true;
    };

    //Standard login check, if there is a user, load the page, if not, redirect to login
    usSpinnerService.spin('spinner');
    $http.get("/Home/CheckSession")
        .then(function (response) {
            usSpinnerService.stop('spinner');
            $scope.$parent.user = response.data;
            $scope.$parent.loaded = true;
            $scope.load();
        }, function () {
            usSpinnerService.stop('spinner');
            toastr["error"]("Not logged in.");
            $location.path('/login');
        });
}]);