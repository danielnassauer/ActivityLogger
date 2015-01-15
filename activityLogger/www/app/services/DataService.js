'use-strict';
angular.module('ActivityLogger').factory('DataService',
    function ($firebase, FIREBASE_URL, $timeout) {

        var rootRef = new Firebase(FIREBASE_URL);

        var usersRef = rootRef.child('users');
        var all_Users_activitiesRef = rootRef.child('all_Users_activities');
        var competitionsRef = rootRef.child('competitions');

        // AngularFire wrapper
        var usersRefAngular = $firebase(usersRef);
        var all_Users_activitiesRefAngular = $firebase(all_Users_activitiesRef);
        var competitionsRefAngular = $firebase(competitionsRef);


        function equal(user1, user2) {
            var isequal =
                ((user1.surname == user2.surname) &&
                (user1.firstname == user2.firstname) &&
                (user1.gender == user2.gender) &&
                (user1.birthday == user2.birthday) &&
                (user1.weight == user2.weight) &&
                (user1.size == user2.size));

            return isequal;
        }

        var service = {
            /**************User*************************/
            /**
             * get All users saved in firebase
             * @return {*}
             */
            getAllUsers: function () {
                return usersRefAngular.$asArray();
            },
            /**
             * Add,save usersprofil only local or local and in firebase
             * @param user
             *
             */
            addUser: function (user) {
                var firebaseConnected = this.getStatus('firebaseConection') == 'true';
                localStorage.setItem('infirebaseSaved', 'false');
                localStorage.setItem('user', JSON.stringify(user));
                if (firebaseConnected) {
                    alert(" persit on firebase ...");
                    this.getAllUsers().$add(user);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('infirebaseSaved', 'true');
                }
            },

            /**
             * Add or update new local Data stored on  offlinemodus (usersprofil,activities)
             * in firebase
             *
             */
            addDataToFirebase: function () {
                var user = this.getUserLocal();
                var userId;
                var infirebaseSaved = this.getStatus('infirebaseSaved');
                var thisS = this;
                if (user != null) {
                    if ((!infirebaseSaved) || (infirebaseSaved == 'false')) {
                        this.addUser(user, true);
                        //Save userId local
                        var timer = $timeout(function () {
                            var users = thisS.getAllUsers();
                            for (var i = 0; i <= users.length; i++) {
                                var f_user = users[i];
                                if (equal(f_user, user)) {
                                    thisS.setStatus('userId', f_user.$id);//Store usersid that was generated by firebase
                                    break;
                                }
                            }
                        }, 4 * 60) //wait 4 seconds
                    } else {
                        // TODO :Update!
                    }

                }
            },

            /**
             * update usersprofil only local or local and in firebase
             * @param user
             */
            updateUser: function (user) {
                localStorage.setItem('user', JSON.stringify(user));
                var firebaseConnected = this.getStatus('firebaseConection') == 'true';
                if (firebaseConnected) {
                    this.getAllUsers().$save(user);
                }
            },
            /**
             * Give user stored in firebase by id
             * @param id
             * @return {Object|null|*}
             */
            getUserByID: function (id) {
                return this.getAllUsers().$getRecord(id);
            },
            /**
             * Give user stored local
             * @return user {number|*}
             */
            getUserLocal: function () {
                var user = localStorage.getItem('user');
                return user ? JSON.parse(user) : null;
            },
            /**
             * remove User by id from firebase
             * @param id
             */
            removeUser: function (id) {
                this.getAllUsers().$remove(this.getUserByID(id));
            },


 /***********************************Activities****************************/
            /**
             *  Give all the activities that have been stored in local
             * @return {*}
             */
            getAllActivities: function () {
                return all_Users_activitiesRefAngular.$asArray();
            },

            /**
             * Give all the activities that have been stored in local
             * @return activites or null{number|*}
             */
            getAllActivitiesLocal: function () {
                var activities = localStorage.getItem('activities');
                return activities ? JSON.parse(activities) : null;
            },
            /**
             * Add,save usersActivities only local or local and in firebase
             * @param activity
             *
             */
            addActivity: function (activity) {
                var firebaseConnected = this.getStatus('firebaseConection') == 'true';
                var userId = this.getStatus('userId');
                var activities = this.getAllActivitiesLocal();
                var nexid = localStorage.getItem('nextActivityId');

                if(!nexid){
                   nexid=1;
                }
                if (activities!= null) {
                    activity.id=nexid;
                    activities.push(activity);
                } else {
                    activities = [];
                    activity.id=nexid;
                    activities.push(activity);
                }
                localStorage.setItem('activities', JSON.stringify(activities));
                localStorage.setItem('infirebaseSaved', 'false');
                localStorage.setItem('nextActivityId', parseInt(nexid) + 1);

                if (firebaseConnected) {
                    alert(" persit on firebase ...");
                    if (userId != null) {
                        activity.userId = userId;
                        this.getAllActivities(userId).$add(activity);
                        localStorage.setItem('infirebaseSaved', 'true');
                    } else {
                        // TO DO ! Popop
                        alert("Sie müssen ein Profil in Firebase  anlegen um Ihre Aktivität speichert zu können !")
                    }

                }


            },
            /**
             * Update Activity only  local or local and in firebase
             * @param _activity
             */
            updateActivity: function (_activity) {
                var activities = this.getAllActivitiesLocal();
                for (var i = 0; i < activities.length; i++) {
                    var activity = activities[i];
                    if ((activity.id == _activity.id)) {
                        activities.splice(i, 1);
                        activities.push(_activity);
                        localStorage.setItem('activities', JSON.stringify(activities));
                        break;
                    }
                }
                var firebaseConnected = this.getStatus('firebaseConection') == 'true';
                if (firebaseConnected) {
                    this.getAllActivities().$save(activity);
                }
            },
            /**
             * Give all Activities by userId
             * @param user_id:  userssId
             * @return arrayObject of all Activities by UserId or null if User don´t have Activity  {Object|null|*}
             */
            getAllActivitiesByUserID: function (user_id) {
                var all_user_activities = this.getAllActivities();
                var all_activitiesByUserID = [];
                for (var i = 0; i < all_user_activities.length; i++) {
                    var activity = all_user_activities[i];
                    if (activity.userId) {
                        if ((activity.userId) == (user_id)) {
                            all_activitiesByUserID.push(activity);
                        }
                    }
                }
                return all_activitiesByUserID.length != 0 ? all_activitiesByUserID : null;

            },
            /**
             * Give Activity by id
             * @param id: activitiy id
             * @return {Object|null|*}
             */
            getActivityByID: function (id) {
                return this.getAllActivities().$getRecord(id);
            },
            /**
             * remove Activity by id
             * @param id: Activity id
             */
            removeActivity: function (id) {
                var firebaseConnected = this.getStatus('firebaseConection') == 'true';

                var activities = this.getAllActivitiesLocal();
                for (var i = 0; i< activities.length; i++) {
                    var activity = activities[i];
                    if (activity.id == id) {
                        activities.splice(i, 1);
                        localStorage.setItem('activities', JSON.stringify(activities));
                        localStorage.setItem('nextActivityId', parseInt(localStorage.getItem('nextActivityId'))-1);
                        break;
                    }
                }
                if(firebaseConnected){
                    this.getAllActivities().$remove(this.getActivityByID(id));
                }

            },
            /**
             *  remove all usersActivities local or local and into firebase
             * @param user_Id: UsersId
             */
            removeAllActivities: function (user_Id) {
                this.getAllActivities(user_Id).$remove();
            },

       /******************************Competition*******************************/
            getAllCompetitions: function () {
                return competitionsRefAngular.$asArray();
            },
            /**
             * Create and Save a Competition
             * @param competition
             *
             */
            addCompetition: function (competition) {
                this.getAllCompetitions().$add(competition);
            },

            /**
             *User remove a competion by id
             * @param id: competitionsId: Integer
             */
            removeCompetition: function (id) {
                this.getAllCompetitions().$remove(this.getCompetitionByID(id));
            },

            /**
             *
             * @param id
             * @return {Object|null|*}
             */
            getCompetitionByID: function (id) {
                return this.getAllCompetitions().$getRecord(id);
            },
            /**
             * Get All Competition for a User by user_Id
             * @param user_id
             * @return {Object|null|*}
             */
            getAllCompetitions: function (user_id) {
                return this.getAllCompetitions().$getRecord(user_id)
            },
            /**
             * get Status from with statusname
             * @param statusname:String
             * @return status: String  with statusnamen or null
             */
            getStatus: function (statusname) {
                var status;
                status = localStorage.getItem(statusname);
                return status ? status : null;
            },
            /**
             *  set and store Status in localstorage
             * @param statusname:String
             * @param statusvalue:boolean,Interger,Float. No JSON Object!!!
             */
            setStatus: function (statusname, statusvalue) {
                localStorage.setItem(statusname, statusvalue);
            }

        };

        return service;

    });